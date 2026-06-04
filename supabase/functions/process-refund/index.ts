import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify user using their token
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) throw new Error('Unauthorized')

    const { invoiceId, action } = await req.json()

    const { data: invoice, error: fetchError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !invoice) throw new Error('Invoice not found')

    let newStatus = ''
    let notifyUserId = ''
    let pushTitle = ''
    let pushBody = ''

    if (action === 'request') {
      if (invoice.payer_id !== user.id) throw new Error('Not the payer')
      if (invoice.status !== 'completed' && invoice.status !== 'escrow')
        throw new Error('Invalid status for refund request')

      newStatus = 'refund_requested'
      notifyUserId = invoice.receiver_id
      pushTitle = 'Refund Request'
      pushBody = `The client requested a refund for: ${invoice.description || 'a service'}`
    } else if (action === 'approve') {
      if (invoice.receiver_id !== user.id) throw new Error('Not the receiver')
      if (invoice.status !== 'refund_requested')
        throw new Error('Invalid status for refund approval')

      newStatus = 'refunded'
      notifyUserId = invoice.payer_id
      pushTitle = 'Refund Approved'
      pushBody = `Your refund for "${invoice.description || 'a service'}" was approved.`
    } else {
      throw new Error('Invalid action')
    }

    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId)

    if (updateError) throw updateError

    // Trigger Push Notification
    if (notifyUserId) {
      await supabaseClient.functions.invoke('send-push', {
        body: {
          userId: notifyUserId,
          title: pushTitle,
          body: pushBody,
          url: '/finance',
        },
      })
    }

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
