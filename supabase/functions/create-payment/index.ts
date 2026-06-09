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
    const { name, email, cpf, phone, city, uf, howHeard, billingType, value } = await req.json()

    // 1. Initialize Supabase Client with Service Role Key (to bypass RLS for secure insertion)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 2. Generate unique ID for the participant row
    const participantId = 'part_' + Date.now() + Math.random().toString(36).substring(2, 6)

    // 3. Insert participant into database with status 'Interessado' (Aguardando Pagamento)
    const { error: dbError } = await supabase
      .from('participants')
      .insert({
        id: participantId,
        name: name,
        whatsapp: phone,
        city: city + ' - ' + uf,
        company: '', // optional
        role: '',    // optional
        observations: `CPF: ${cpf} | Como Conheceu: ${howHeard}`,
        status: 'Interessado',
        date_added: new Date().toISOString().split('T')[0]
      })

    if (dbError) {
      throw new Error(`Error saving participant: ${dbError.message}`)
    }

    // 4. Connect to Asaas API using Token from environment
    const asaasToken = Deno.env.get('ASAAS_API_KEY')
    if (!asaasToken) {
      throw new Error('ASAAS_API_KEY environment variable is not set in Supabase.')
    }

    const asaasUrl = 'https://www.asaas.com/api/v3'

    // A. Create Customer in Asaas
    const customerResponse = await fetch(`${asaasUrl}/customers`, {
      method: 'POST',
      headers: {
        'access_token': asaasToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        cpfCnpj: cpf.replace(/\D/g, '') // remove mask formatting
      })
    })

    const customerData = await customerResponse.json()
    if (!customerResponse.ok || customerData.errors) {
      const err = customerData.errors?.[0]?.description || 'Failed to create customer in Asaas'
      throw new Error(err)
    }

    const customerId = customerData.id

    // B. Create Payment in Asaas
    // Due date set to 2 days from now or event date (which is 2026-08-16)
    // To ensure they pay promptly, set payment due date to 3 days from registration.
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)
    const formattedDueDate = dueDate.toISOString().split('T')[0]

    let paymentResponse = await fetch(`${asaasUrl}/payments`, {
      method: 'POST',
      headers: {
        'access_token': asaasToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: billingType === 'PIX' ? 'PIX' : (billingType === 'BOLETO' ? 'BOLETO' : 'CREDIT_CARD'),
        value: Number(value),
        dueDate: formattedDueDate,
        description: `AI Experience Estância Velha - Ingresso`,
        externalReference: participantId
      })
    })

    let paymentData = await paymentResponse.json()

    // Fallback: If PIX is requested but not allowed by the Asaas account settings, fall back to CREDIT_CARD
    if (billingType === 'PIX' && (!paymentResponse.ok || paymentData.errors)) {
      const errDescription = paymentData.errors?.[0]?.description || ''
      if (errDescription.includes('não permite pagamentos via Pix') || errDescription.includes('Pix') || errDescription.includes('PIX')) {
        console.warn('PIX billing type not allowed on Asaas account. Falling back to CREDIT_CARD.');
        
        paymentResponse = await fetch(`${asaasUrl}/payments`, {
          method: 'POST',
          headers: {
            'access_token': asaasToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer: customerId,
            billingType: 'CREDIT_CARD',
            value: Number(value),
            dueDate: formattedDueDate,
            description: `AI Experience Estância Velha - Ingresso`,
            externalReference: participantId
          })
        })
        paymentData = await paymentResponse.json()
      }
    }

    if (!paymentResponse.ok || paymentData.errors) {
      const err = paymentData.errors?.[0]?.description || 'Failed to create charge in Asaas'
      throw new Error(err)
    }

    const paymentId = paymentData.id
    const invoiceUrl = paymentData.invoiceUrl
    const actualBillingType = paymentData.billingType || billingType

    // C. If PIX, retrieve QR Code image and payload
    if (actualBillingType === 'PIX') {
      const pixResponse = await fetch(`${asaasUrl}/payments/${paymentId}/pixQrCode`, {
        method: 'GET',
        headers: {
          'access_token': asaasToken
        }
      })

      const pixData = await pixResponse.json()
      if (!pixResponse.ok || pixData.errors) {
        const err = pixData.errors?.[0]?.description || 'Failed to generate Pix QR Code'
        throw new Error(err)
      }

      return new Response(
        JSON.stringify({
          success: true,
          billingType: 'PIX',
          participantId,
          paymentId,
          pixQrCodeBase64: pixData.encodedImage,
          pixCopyPaste: pixData.payload,
          invoiceUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // D. If Credit Card or Boleto, return redirect payment link
    return new Response(
      JSON.stringify({
        success: true,
        billingType: actualBillingType,
        participantId,
        paymentId,
        invoiceUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
