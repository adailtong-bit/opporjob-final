import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface ShareData {
  title?: string
  text?: string
  url?: string
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
    }
  }, [])

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      toast.info(
        'O aplicativo já está instalado ou a instalação não é suportada neste navegador.',
      )
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
      toast.success('Aplicativo instalado com sucesso!')
    } else {
      toast.info('Instalação cancelada.')
    }
  }, [deferredPrompt])

  const shareContent = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title || 'OPPORJOB',
          text: data.text || 'Confira isso na OPPORJOB!',
          url: data.url || window.location.href,
        })
      } catch (err) {
        console.error('Erro ao compartilhar:', err)
      }
    } else {
      if (data.url) {
        navigator.clipboard.writeText(data.url)
        toast.success('Link copiado para a área de transferência!')
      } else {
        toast.error('Compartilhamento nativo não suportado neste dispositivo.')
      }
    }
  }, [])

  const setBadge = useCallback(async (count: number) => {
    if ('setAppBadge' in navigator) {
      try {
        await (navigator as any).setAppBadge(count)
      } catch (err) {
        console.error('Erro ao configurar badge:', err)
      }
    } else {
      toast.error('Badging API não é suportada pelo seu navegador.')
    }
  }, [])

  const clearBadge = useCallback(async () => {
    if ('clearAppBadge' in navigator) {
      try {
        await (navigator as any).clearAppBadge()
      } catch (err) {
        console.error('Erro ao limpar badge:', err)
      }
    }
  }, [])

  const subscribeToPushNotifications = useCallback(async (userId: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { error: 'Push notifications not supported' }
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.warn('VITE_VAPID_PUBLIC_KEY not found. Mocking push sub.')
      return { success: true, mocked: true }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          return { error: 'Permission denied' }
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidKey)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        })
      }

      if (subscription) {
        const subData = subscription.toJSON()
        const { error } = await supabase.from('push_subscriptions').upsert(
          {
            user_id: userId,
            endpoint: subData.endpoint!,
            auth: subData.keys?.auth!,
            p256dh: subData.keys?.p256dh!,
          },
          { onConflict: 'endpoint' },
        )

        if (error) {
          console.error('Supabase upsert error:', error)
          return { error }
        }
        return { success: true }
      }
    } catch (err) {
      console.error('Push sub error:', err)
      return { error: err }
    }
  }, [])

  return {
    isInstallable,
    installPWA,
    shareContent,
    setBadge,
    clearBadge,
    subscribeToPushNotifications,
  }
}
