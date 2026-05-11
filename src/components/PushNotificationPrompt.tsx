import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePWA } from '@/hooks/use-pwa'
import { toast } from 'sonner'
import { BellRing, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PushNotificationPrompt() {
  const { user } = useAuthStore()
  const { subscribeToPushNotifications } = usePWA()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!user) return

    const checkPermission = async () => {
      if (!('Notification' in window)) return

      if (Notification.permission === 'default') {
        const dismissed = localStorage.getItem('push_prompt_dismissed')
        if (!dismissed) {
          const timer = setTimeout(() => setShow(true), 3000)
          return () => clearTimeout(timer)
        }
      }
    }

    checkPermission()
  }, [user])

  const handleSubscribe = async () => {
    setShow(false)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted' && user) {
        const result = await subscribeToPushNotifications(user.id)
        if (result?.success) {
          toast.success('Notificações ativadas com sucesso!')
        } else if (result?.mocked) {
          toast.success('Notificações ativadas no modo simulado.')
        } else {
          toast.error('Erro ao configurar notificações.')
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('push_prompt_dismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-fade-in-up">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-xl p-4 flex flex-col gap-3 relative overflow-hidden border border-primary/20">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-primary-foreground/70 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="bg-primary-foreground/20 p-2 rounded-full">
            <BellRing className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Ativar Notificações</h4>
            <p className="text-sm text-primary-foreground/90 leading-snug">
              Receba alertas em tempo real sobre novas vagas e atualizações do
              seu perfil diretamente na tela do celular.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <Button
            variant="secondary"
            className="flex-1 font-semibold text-primary"
            onClick={handleSubscribe}
          >
            Ativar Agora
          </Button>
        </div>
      </div>
    </div>
  )
}
