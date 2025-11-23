import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { allowedOrigins, corsHeaders } from '../_shared/jwt-auth.ts'

interface FacebookPageResponse {
  data: Array<{
    id: string
    name: string
    access_token: string
    category?: string
  }>
}

interface InstagramDetailsResponse {
  id: string
  username: string
}

interface InstagramAccountResponse {
  instagram_business_account?: {
    id: string
  }
}

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
    const { code } = await req.json()
    
    if (!code) {
      throw new Error('Missing code')
    }

    const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID')
    const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      throw new Error('Facebook credentials not configured')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured')
    }

    // Admin client for DB writes
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    // Auth-aware client to get the current user id from the JWT
    const supabaseAuth = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    })

    const { data: authData, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !authData?.user) {
      console.error('Auth getUser error:', authError)
      throw new Error('Not authenticated')
    }
    const userId = authData.user.id

    console.log('Exchanging code for access token...')
    
    // Exchange code for user access token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent('https://zidna-sociahub.lovable.app/settings')}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`
    
    const tokenResponse = await fetch(tokenUrl)
    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData)
      throw new Error('Failed to exchange code for token')
    }

    const userAccessToken = tokenData.access_token
    console.log('Got user access token')

    // Debug: Check what permissions were actually granted
    const permissionsUrl = `https://graph.facebook.com/v21.0/me/permissions?access_token=${userAccessToken}`
    const permissionsResponse = await fetch(permissionsUrl)
    const permissionsData = await permissionsResponse.json()
    console.log('Granted permissions:', JSON.stringify(permissionsData, null, 2))

    // Get all user's Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,category&access_token=${userAccessToken}`
    const pagesResponse = await fetch(pagesUrl)
    const pagesData: FacebookPageResponse = await pagesResponse.json()

    console.log('Facebook Pages API Response:', JSON.stringify(pagesData, null, 2))
    console.log('Response status:', pagesResponse.status)

    // Check if Facebook returned an error
    if ('error' in pagesData) {
      console.error('Facebook API Error:', JSON.stringify(pagesData, null, 2))
      throw new Error(`Facebook API Error: ${(pagesData as any).error.message || 'Unknown error'}`)
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('No pages in response. Full response:', JSON.stringify(pagesData, null, 2))
      throw new Error('No Facebook pages found. Make sure you have at least one Facebook Page and have granted the pages_show_list permission.')
    }

    console.log(`Found ${pagesData.data.length} Facebook pages`)

    const results = []

    // Process each page
    for (const page of pagesData.data) {
      const pageId = page.id
      const pageName = page.name
      const pageToken = page.access_token

      console.log(`Processing page: ${pageName} (${pageId})`)

      // Make page token long-lived
      const longLivedTokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${pageToken}`
      
      const longLivedResponse = await fetch(longLivedTokenUrl)
      const longLivedData = await longLivedResponse.json()
      
      const longLivedToken = longLivedData.access_token || pageToken
      console.log(`Got long-lived token for page ${pageId}`)

      // Check if page has Instagram Business Account
      const igCheckUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${longLivedToken}`
      const igCheckResponse = await fetch(igCheckUrl)
      const igCheckData: InstagramAccountResponse = await igCheckResponse.json()

      const instagramAccountId = igCheckData.instagram_business_account?.id

      // Save Facebook page to database (store category and page long-lived token)
      const { error: fbError } = await supabase
        .from('facebook_pages')
        .upsert({
          user_id: userId,
          owner_id: userId,
          page_id: pageId,
          page_name: pageName,
          access_token: longLivedToken,
          instagram_business_account_id: instagramAccountId || null,
          is_connected: true,
          category: (page as any).category || null,
        }, {
          onConflict: 'user_id,page_id'
        })

      if (fbError) {
        console.error(`Error saving Facebook page ${pageId}:`, fbError)
        results.push({ page: pageName, facebook: 'error', instagram: 'skipped' })
        continue
      }

      console.log(`Saved Facebook page ${pageId} to database`)

      // Subscribe to Facebook webhooks
      try {
        const fbWebhookUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`
        const fbWebhookResponse = await fetch(fbWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscribed_fields: 'messages,feed,comments',
            access_token: longLivedToken
          })
        })
        
        const fbWebhookData = await fbWebhookResponse.json()
        console.log(`Facebook webhook subscription for ${pageId}:`, fbWebhookData)
      } catch (error) {
        console.error(`Failed to subscribe to Facebook webhooks for ${pageId}:`, error)
      }

      // If Instagram account exists, save it and subscribe to webhooks
      if (instagramAccountId) {
        console.log(`Found Instagram account: ${instagramAccountId}`)

        // Get the facebook_page record ID
        const { data: fbPage } = await supabase
          .from('facebook_pages')
          .select('id')
          .eq('user_id', userId)
          .eq('page_id', pageId)
          .single()

        // Fetch Instagram account details (id, username)
        let igUsername: string | null = null
        try {
          const igDetailsUrl = `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username&access_token=${longLivedToken}`
          const igDetailsResponse = await fetch(igDetailsUrl)
          const igDetailsData: InstagramDetailsResponse = await igDetailsResponse.json()
          igUsername = igDetailsData?.username || null
          console.log(`Fetched Instagram details for ${instagramAccountId}:`, igDetailsData)
        } catch (err) {
          console.error(`Failed to fetch Instagram details for ${instagramAccountId}:`, err)
        }

        // Save Instagram account with username and page token
        const { error: igError } = await supabase
          .from('instagram_accounts')
          .upsert({
            user_id: userId,
            owner_id: userId,
            facebook_page_id: fbPage?.id,
            instagram_account_id: instagramAccountId,
            username: igUsername,
            access_token: longLivedToken,
            page_id: pageId,
            is_connected: true,
          }, {
            onConflict: 'user_id,instagram_account_id'
          })

        if (igError) {
          console.error(`Error saving Instagram account ${instagramAccountId}:`, igError)
          results.push({ page: pageName, facebook: 'success', instagram: 'error' })
          continue
        }

        console.log(`Saved Instagram account ${instagramAccountId} to database`)

        // Subscribe to Instagram webhooks (via Facebook Page)
        try {
          const igWebhookUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`
          const igWebhookResponse = await fetch(igWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscribed_fields: 'messages,comments',
              access_token: longLivedToken
            })
          })
          
          const igWebhookData = await igWebhookResponse.json()
          console.log(`Instagram webhook subscription for ${pageId}:`, igWebhookData)
        } catch (error) {
          console.error(`Failed to subscribe to Instagram webhooks for ${pageId}:`, error)
        }

        results.push({ page: pageName, facebook: 'success', instagram: 'success' })
      } else {
        results.push({ page: pageName, facebook: 'success', instagram: 'not_found' })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Connected successfully',
        results 
      }),
      { 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Error in facebook-oauth-callback:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
