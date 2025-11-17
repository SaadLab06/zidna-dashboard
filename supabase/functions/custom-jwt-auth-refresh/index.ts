import { 
  supabase, 
  createToken, 
  verifyToken,
  allowedOrigins,
  corsHeaders
} from '../_shared/jwt-auth.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  
  // Check if origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(origin)
    });
  }

  try {
    const { token } = await req.json();
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), { 
        status: 401,
        headers: corsHeaders(origin)
      });
    }

    // Verify the refresh token
    const decoded: any = await verifyToken(token, 'refresh');

    // Check if token exists in database
    const { data: tokenRow, error: fetchError } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', decoded.userId)
      .eq('refresh_token', token)
      .single();

    if (fetchError || !tokenRow) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401,
        headers: corsHeaders(origin)
      });
    }

    // Generate new token with rotation
    const newToken = await createToken(
      { 
        userId: decoded.userId, 
        email: decoded.email
      }, 
      'refresh'
    );

    // Store the rotated token in DB
    const { error: insertError } = await supabase
      .from('user_oauth_tokens')
      .insert({ 
        user_id: decoded.userId, 
        provider: tokenRow.provider, 
        refresh_token: newToken,
        access_token: newToken,
        created_at: new Date().toISOString() 
      });

    if (insertError) {
      console.error('Error storing new token:', insertError);
    }

    // Optionally: Delete old token for security
    await supabase
      .from('user_oauth_tokens')
      .delete()
      .eq('id', tokenRow.id);

    return new Response(JSON.stringify({ token: newToken }), {
      status: 200,
      headers: corsHeaders(origin)
    });

  } catch (err) {
    console.error('Token refresh error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Unauthorized', details: errorMessage }), { 
      status: 401,
      headers: corsHeaders(origin || allowedOrigins[0])
    });
  }
});
