import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'eduardo@esquadriasmoradadosol.com.br'
const DEFAULT_TICKET_PRICE = 350 // R$ 350,00

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { billingType, card, adminTestMode } = await req.json()

    // 1. Initialize Supabase Clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 2. Get authenticated user from the JWT in the Authorization header
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Usuário não autenticado. Faça login novamente.')
    }

    // 3. Extract user data from auth metadata
    const meta = user.user_metadata || {}
    const name = meta.name || user.email?.split('@')[0] || 'Participante'
    const email = user.email || ''
    const cpf = (meta.cpf || '').replace(/\D/g, '')
    const phone = (meta.phone || '').replace(/\D/g, '')
    const city = meta.city || ''
    const uf = meta.uf || ''
    const howHeard = meta.howHeard || ''

    if (!cpf || cpf.length !== 11) {
      throw new Error('CPF inválido no cadastro. Atualize seu perfil antes de pagar.')
    }

    // 4. Determine payment value (admin test mode support)
    const isAdminUser = email.toLowerCase().trim() === ADMIN_EMAIL
    let paymentValue = DEFAULT_TICKET_PRICE

    try {
      const { data: finSettingsData, error: finSettingsError } = await supabaseAdmin
        .from('financial_settings')
        .select('ticket_price_default')
        .limit(1)
        .maybeSingle()

      if (!finSettingsError && finSettingsData?.ticket_price_default) {
        paymentValue = Number(finSettingsData.ticket_price_default)
      }
    } catch (err) {
      console.error('Failed to fetch financial_settings:', err)
    }

    if (adminTestMode && isAdminUser) {
      paymentValue = billingType === 'CREDIT_CARD' ? 5.00 : 0.03
    }

    // 5. Generate unique ID for the participant row
    const participantId = 'part_' + Date.now() + Math.random().toString(36).substring(2, 6)

    // 6. Insert participant into database with status 'Interessado' (Aguardando Pagamento)
    const { error: dbError } = await supabaseAdmin
      .from('participants')
      .insert({
        id: participantId,
        name: name,
        whatsapp: phone,
        city: city ? city + (uf ? ' - ' + uf : '') : '',
        company: '',
        role: '',
        observations: `CPF: ${cpf} | Como Conheceu: ${howHeard}`,
        status: 'Interessado',
        date_added: new Date().toISOString().split('T')[0]
      })

    if (dbError) {
      throw new Error(`Error saving participant: ${dbError.message}`)
    }

    // 7. Connect to Asaas API using Token from environment
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
        cpfCnpj: cpf
      })
    })

    const customerData = await customerResponse.json()
    if (!customerResponse.ok || customerData.errors) {
      const err = customerData.errors?.[0]?.description || 'Failed to create customer in Asaas'
      throw new Error(err)
    }

    const customerId = customerData.id

    // B. Create Payment in Asaas
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)
    const formattedDueDate = dueDate.toISOString().split('T')[0]

    const bodyPayload: any = {
      customer: customerId,
      billingType: billingType === 'PIX' ? 'PIX' : (billingType === 'BOLETO' ? 'BOLETO' : 'CREDIT_CARD'),
      dueDate: formattedDueDate,
      description: `AI Experience Estância Velha - Ingresso`,
      externalReference: participantId
    }

    // Standard Transparent Credit Card processing if card info is passed
    if (billingType === 'CREDIT_CARD' && card) {
      const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1'
      const installments = Number(card.installments || 1)
      
      if (installments > 1) {
        bodyPayload.totalValue = paymentValue
        bodyPayload.installmentCount = installments
      } else {
        bodyPayload.value = paymentValue
      }
      
      bodyPayload.creditCard = {
        holderName: card.holderName,
        number: card.number.replace(/\s/g, ''),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.cvv
      }
      bodyPayload.creditCardHolderInfo = {
        name: name,
        email: email,
        cpfCnpj: cpf,
        postalCode: card.cep.replace(/\D/g, ''),
        addressNumber: card.addressNumber,
        phone: phone
      }
      bodyPayload.remoteIp = remoteIp
    } else {
      bodyPayload.value = paymentValue
    }

    let paymentResponse = await fetch(`${asaasUrl}/payments`, {
      method: 'POST',
      headers: {
        'access_token': asaasToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    })

    let paymentData = await paymentResponse.json()

    // Fallback: If PIX is requested but not allowed by the Asaas account settings, fall back to CREDIT_CARD (Redirect mode)
    if (billingType === 'PIX' && (!paymentResponse.ok || paymentData.errors)) {
      const errDescription = paymentData.errors?.[0]?.description || ''
      if (errDescription.includes('não permite pagamentos via Pix') || errDescription.includes('Pix') || errDescription.includes('PIX')) {
        console.warn('PIX billing type not allowed on Asaas account. Falling back to CREDIT_CARD redirect.');
        
        paymentResponse = await fetch(`${asaasUrl}/payments`, {
          method: 'POST',
          headers: {
            'access_token': asaasToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer: customerId,
            billingType: 'CREDIT_CARD',
            value: paymentValue,
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

    // Update DB status immediately to 'Pago' if transparent credit card checkout was approved/confirmed
    if (billingType === 'CREDIT_CARD' && card && (paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED')) {
      const { error: updateError } = await supabaseAdmin
        .from('participants')
        .update({ status: 'Pago' })
        .eq('id', participantId)

      if (updateError) {
        console.error(`Error updating participant status to Pago: ${updateError.message}`)
      }
    }

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

    // D. If transparent BOLETO, return the barcode and digital line data
    if (actualBillingType === 'BOLETO') {
      const boletoResponse = await fetch(`${asaasUrl}/payments/${paymentId}/identificationField`, {
        method: 'GET',
        headers: {
          'access_token': asaasToken
        }
      })

      const boletoData = await boletoResponse.json()
      if (!boletoResponse.ok || boletoData.errors) {
        const err = boletoData.errors?.[0]?.description || 'Failed to generate Boleto details'
        throw new Error(err)
      }

      return new Response(
        JSON.stringify({
          success: true,
          billingType: 'BOLETO',
          participantId,
          paymentId,
          invoiceUrl,
          identificationField: boletoData.identificationField,
          barCode: boletoData.barCode,
          bankSlipUrl: paymentData.bankSlipUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // E. Otherwise (Credit Card redirect/transparent or standard Boleto redirect), return standard link
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
