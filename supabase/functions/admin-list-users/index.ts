import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Authenticate requester
    const authHeader = req.headers.get('Authorization') || ''
    const jwt = authHeader.replace('Bearer ', '')
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: userData, error: userErr } = await adminClient.auth.getUser(jwt)
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Authorization: must be superadmin
    const { data: roleRow, error: roleErr } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (roleErr) {
      console.error('Role check error', roleErr)
      return new Response(JSON.stringify({ error: 'Role check failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (roleRow?.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // List users using Admin API
    const users: any[] = []
    let page = 1
    const perPage = 200

    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
      if (error) {
        console.error('listUsers error', error)
        return new Response(JSON.stringify({ error: 'Failed to list users' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      users.push(...(data?.users || []))
      if (!data || data.users.length < perPage) break
      page += 1
      if (page > 25) break // safety guard
    }

    // Minimal fields and client-side filter
    const simplified = users
      .map((u) => ({ id: u.id, email: u.email ?? '', created_at: u.created_at }))
      .filter((u) => (search ? (u.email?.toLowerCase().includes(search) || u.id.toLowerCase().includes(search)) : true))

    return new Response(JSON.stringify({ users: simplified }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('Unhandled error', e)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
