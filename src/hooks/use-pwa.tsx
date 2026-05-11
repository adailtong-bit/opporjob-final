import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface ShareData {
  title?: string
  text?: string
  url?: string
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      // Update UI to notify the user they can install the PWA
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
    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
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
      // Fallback
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

  return {
    isInstallable,
    installPWA,
    shareContent,
    setBadge,
    clearBadge,
  }
}
