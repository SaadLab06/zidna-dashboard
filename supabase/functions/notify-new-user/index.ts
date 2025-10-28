import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  user_id: string
  email: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    console.log('Received new user notification:', payload)

    // Send to n8n webhook
    const n8nWebhookUrl = 'https://n8n.srv1048592.hstgr.cloud/webhook/new-user'
    
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        id: payload.user_id,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!webhookResponse.ok) {
      console.error('Failed to send to n8n:', await webhookResponse.text())
      throw new Error('Failed to notify n8n webhook')
    }

    console.log('Successfully notified n8n webhook for user:', payload.email)

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook notification sent' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
