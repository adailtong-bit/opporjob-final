import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14.14.0'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, invoiceId, sessionId, returnUrl } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    if (action === 'create_checkout') {
      if (!invoiceId) throw new Error('Invoice ID is required')

      const { data: invoice, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError || !invoice) throw new Error('Invoice not found')

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: (invoice.currency || 'usd').toLowerCase(),
              product_data: {
                name: invoice.description || 'Plan Subscription',
              },
              unit_amount: Math.round(invoice.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}?cancelled=true`,
        client_reference_id: invoiceId,
      })

      await supabaseClient
        .from('invoices')
        .update({ stripe_session_id: session.id })
        .eq('id', invoiceId)

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'verify_checkout') {
      if (!sessionId) throw new Error('Session ID is required')

      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.payment_status === 'paid') {
        const invId = session.client_reference_id
        if (invId) {
          await supabaseClient
            .from('invoices')
            .update({
              status: 'paid',
              payment_date: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('id', invId)
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } else {
        return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    throw new Error('Invalid action')
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
