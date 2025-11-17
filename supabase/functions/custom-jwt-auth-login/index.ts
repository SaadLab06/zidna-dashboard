import { 
  supabase, 
  createToken, 
  storeRefreshToken, 
  verifyPassword, 
  verifyGoogleToken, 
  verifyFacebookToken,
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
    const { email, password, provider, oauthToken } = await req.json();
    let user: any;

    // Google OAuth authentication
    if (provider === 'google') {
      const googleData = await verifyGoogleToken(oauthToken);
      if (!googleData) {
        return new Response(JSON.stringify({ error: 'Invalid Google token' }), { 
          status: 401,
          headers: corsHeaders(origin)
        });
      }
      
      // Check if user exists
      const { data: dbUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', googleData.sub)
        .single();
      
      if (dbUser) {
        user = dbUser;
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error } = await supabase.auth.admin.createUser({
          email: googleData.email,
          email_confirm: true,
          user_metadata: {
            full_name: googleData.name,
            provider: 'google'
          }
        });
        
        if (error || !authData.user) {
          return new Response(JSON.stringify({ error: 'Failed to create user' }), { 
            status: 500,
            headers: corsHeaders(origin)
          });
        }
        
        user = { id: authData.user.id, email: googleData.email, full_name: googleData.name };
      }

    // Facebook OAuth authentication
    } else if (provider === 'facebook') {
      const fbData = await verifyFacebookToken(oauthToken);
      if (!fbData) {
        return new Response(JSON.stringify({ error: 'Invalid Facebook token' }), { 
          status: 401,
          headers: corsHeaders(origin)
        });
      }
      
      const fbEmail = fbData.email;
      const { data: dbUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', fbData.user_id)
        .single();
      
      if (dbUser) {
        user = dbUser;
      } else {
        const { data: authData, error } = await supabase.auth.admin.createUser({
          email: fbEmail,
          email_confirm: true,
          user_metadata: {
            full_name: fbData.name || 'Facebook User',
            provider: 'facebook'
          }
        });
        
        if (error || !authData.user) {
          return new Response(JSON.stringify({ error: 'Failed to create user' }), { 
            status: 500,
            headers: corsHeaders(origin)
          });
        }
        
        user = { id: authData.user.id, email: fbEmail, full_name: fbData.name || 'Facebook User' };
      }

    // Email/Password authentication
    } else if (provider === 'email' || (!provider && email && password)) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error || !authData.user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
          status: 401,
          headers: corsHeaders(origin)
        });
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      user = profile || { id: authData.user.id, email: authData.user.email };

    } else {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { 
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    // Generate the unique token that will serve as access token
    const newToken = await createToken(
      { 
        userId: user.id || user.user_id, 
        email: user.email || email
      }, 
      'refresh'
    );

    // Store in DB
    await storeRefreshToken(
      user.id || user.user_id, 
      provider || 'email', 
      newToken, 
      user.email || email
    );

    return new Response(JSON.stringify({ 
      token: newToken, 
      user: { 
        id: user.id || user.user_id, 
        email: user.email || email, 
        displayName: user.full_name || user.display_name
      } 
    }), {
      status: 200,
      headers: corsHeaders(origin)
    });

  } catch (err) {
    console.error('Authentication error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Authentication failed', details: errorMessage }), { 
      status: 500,
      headers: corsHeaders(origin || allowedOrigins[0])
    });
  }
});
