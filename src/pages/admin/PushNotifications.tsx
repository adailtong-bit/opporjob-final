import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Send, Users } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function PushNotifications() {
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/')
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState({ subscribedUsers: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })
    setStats({ subscribedUsers: count || 0 })
  }

  const handleSend = async () => {
    if (!title || !body) return
    setSending(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-push', {
        body: { userId: 'ALL', title, body, url },
      })
      if (error) throw error

      toast({
        title: t('admin.push.success') || 'Success!',
        description: `Sent to ${data?.count || 0} devices.`,
      })

      setTitle('')
      setBody('')
      setUrl('/')
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-0">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('admin.push.title') || 'Push Notifications'}
        </h2>
        <p className="text-muted-foreground">
          {t('admin.push.desc') || 'Send notifications to all app users.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Mensagem</CardTitle>
              <CardDescription>
                Crie uma notificação para enviar a todos os inscritos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('admin.push.form.title') || 'Title'}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nova Vaga Disponível!"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('admin.push.form.body') || 'Body'}
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ex: Confira as novas oportunidades de trabalho na sua região."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('admin.push.form.url') || 'Link URL'}
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/find-jobs"
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={sending || !title || !body}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending
                  ? t('admin.push.sending') || 'Sending...'
                  : t('admin.push.send') || 'Send Notification'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dispositivos Ativos
                  </p>
                  <p className="text-2xl font-bold">{stats.subscribedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
