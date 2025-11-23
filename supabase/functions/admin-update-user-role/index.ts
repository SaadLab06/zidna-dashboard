import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';
import { allowedOrigins, corsHeaders } from '../_shared/jwt-auth.ts'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) })
  }

  // Validate origin
  if (!allowedOrigins.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Forbidden origin' }),
      { status: 403, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Verify the request is from an authenticated superadmin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is superadmin
    const userRole = user.user_metadata?.app_role;
    if (userRole !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only superadmins can update roles' }),
        { status: 403, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or role' }),
        { status: 400, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['client', 'moderator', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
      );
    }

    // Update user metadata with new role
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          app_role: role
        }
      }
    );

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, userId, role }),
      { status: 200, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error updating user role:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } }
    );
  }
});
