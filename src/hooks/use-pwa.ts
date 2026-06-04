import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export function usePWA() {
  const [badge, setBadgeCount] = useState(0)

  const setBadge = useCallback((count: number) => {
    setBadgeCount(count)
    if ('setAppBadge' in navigator) {
      ;(navigator as any).setAppBadge(count).catch(console.error)
    }
  }, [])

  const clearBadge = useCallback(() => {
    setBadgeCount(0)
    if ('clearAppBadge' in navigator) {
      ;(navigator as any).clearAppBadge().catch(console.error)
    }
  }, [])

  const subscribeToPushNotifications = useCallback(async (userId: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, error: 'Push not supported in this browser' }
    }
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          import.meta.env.VITE_VAPID_PUBLIC_KEY ||
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5hAMDAs2PE2bVvHqBsgR6I',
      })

      const subJson = subscription.toJSON()
      if (!subJson.keys) throw new Error('Subscription keys missing')

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        { onConflict: 'endpoint' },
      )

      if (error) throw error

      return { success: true }
    } catch (e: any) {
      console.error('Push subscription failed:', e)
      return { success: false, error: e.message }
    }
  }, [])

  return { badge, setBadge, clearBadge, subscribeToPushNotifications }
}
