import { supabase, allowedOrigins, corsHeaders, parseCookies, hashToken } from '../_shared/jwt-auth.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  
  // Check origin
  if (!allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403, headers: corsHeaders(origin) });
  }

  try {
    // Try to get token from multiple sources
    let token: string | null = null;
    
    // 1. Check Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
    
    // 2. Check cookies
    if (!token) {
      const cookies = parseCookies(req.headers.get("cookie") ?? "");
      token = cookies.refresh_token || null;
    }
    
    // 3. Check request body
    if (!token && req.method === 'POST') {
      try {
        const body = await req.json();
        token = body.token || null;
      } catch {
        // Invalid JSON, continue
      }
    }

    // If we have a token, delete it from the database
    if (token) {
      const hashedToken = await hashToken(token);
      
      const { error } = await supabase
        .from("user_oauth_tokens")
        .delete()
        .eq("refresh_token", hashedToken);
      
      if (error) {
        console.error('Error deleting refresh token:', error);
      } else {
        console.log('Refresh token deleted successfully');
      }
    }

    // Clear cookie by setting it to expire
    const cookieParts = [
      'refresh_token=deleted',
      'HttpOnly',
      'Secure',
      'Path=/',
      'SameSite=None',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    ];

    return new Response(JSON.stringify({ message: "Logged out successfully" }), {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        'Set-Cookie': cookieParts.join('; ')
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: "Logout failed" }), {
      status: 500,
      headers: corsHeaders(origin)
    });
  }
});
