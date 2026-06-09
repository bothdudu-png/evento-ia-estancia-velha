import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify Asaas Webhook Secret Token
    const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN')
    const receivedToken = req.headers.get('asaas-access-token')

    if (webhookToken && receivedToken !== webhookToken) {
      console.warn('Unauthorized webhook request received (token mismatch).')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { event, payment } = body

    // We only care about payment confirmed events
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const participantId = payment.externalReference

      if (participantId && participantId.startsWith('part_')) {
        // 1. Initialize Supabase Client with Service Role Key (to bypass RLS for secure updates)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        // 2. Update participant status to 'Pago' in database
        const { data, error } = await supabase
          .from('participants')
          .update({ status: 'Pago' })
          .eq('id', participantId)
          .select()

        if (error) {
          throw new Error(`Failed to update participant status: ${error.message}`)
        }

        console.log(`Payment confirmed webhook received: Participant ${participantId} updated to Pago successfully.`, data)
      } else {
        console.warn(`Webhook received payment event, but externalReference is invalid: ${participantId}`)
      }
    } else {
      console.log(`Webhook received event "${event}" - ignored (not a payment confirmation).`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error(`Error in asaas-webhook: ${error.message}`)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
