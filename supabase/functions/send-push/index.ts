import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || ''

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@opporjob.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const payload = await req.json()
    const targetUserId = payload.userId || user.id

    const { data: subscriptions } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', targetUserId)

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const pushPayload = JSON.stringify({
      title: payload.title || 'OPPORJOB',
      body: payload.body || 'Nova notificação na plataforma.',
      url: payload.url || '/',
    })

    const sendPromises = subscriptions.map((sub: any) => {
      if (!VAPID_PUBLIC_KEY) {
        console.log('Skipping real push, no VAPID keys set. MOCK success.')
        return Promise.resolve()
      }
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      }
      return webpush.sendNotification(pushSubscription, pushPayload).catch(err => {
        console.error('Error sending push to endpoint:', sub.endpoint, err)
        if (err.statusCode === 410 || err.statusCode === 404) {
          return supabaseClient.from('push_subscriptions').delete().eq('id', sub.id)
        }
      })
    })

    await Promise.all(sendPromises)

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
