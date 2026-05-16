import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Heart, Shield, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { conversations, interests, sendInterest, getOrCreateConversation } =
    useMessageStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t, formatCurrency } = useLanguageStore()

  const [targetUser, setTargetUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      if (!id) return
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        setTargetUser({
          id: data.id,
          name: data.name || data.company_name || 'Professional',
          avatar:
            data.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`,
          openChat: true, // Assuming default open chat for simplicity
          role: data.role || 'executor',
          reputation: 5.0, // Mock reputation
          location:
            data.city && data.state
              ? `${data.city} - ${data.state}`
              : 'Location unknown',
          portfolio: data.portfolio_photos || [],
          services: data.priced_services || [],
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  if (!targetUser) return <div className="p-8 text-center">User not found</div>

  if (!user)
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('profile.login_required')}
      </div>
    )

  if (user.id === id) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">{t('profile.public_title')}</h2>
        <p className="text-muted-foreground">{t('profile.public_desc')}</p>
        <Button onClick={() => navigate('/settings')}>
          {t('profile.go_settings')}
        </Button>
      </div>
    )
  }

  const isPremium = user.isPremium

  const existingConversation = conversations.find(
    (c) =>
      c.participants.some((p) => p.id === user.id) &&
      c.participants.some((p) => p.id === id),
  )
  const existingInterest = interests.find(
    (i) => i.senderId === user.id && i.targetId === id,
  )

  const canMessage = targetUser.openChat || isPremium || !!existingConversation

  const handleAction = () => {
    if (canMessage) {
      const convId = getOrCreateConversation(
        { id: user.id, name: user.name, avatar: user.avatar || '' },
        {
          id: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
        },
      )
      navigate(`/messages?conv=${convId}`)
    } else {
      sendInterest(
        { id: user.id, name: user.name, avatar: user.avatar },
        targetUser.id,
      )
      toast({
        title: 'Interest Sent!',
        description: 'Wait for the user to accept to start chatting.',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" className="mb-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
      </Button>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-28 w-28 border-4 border-muted">
            <AvatarImage src={targetUser.avatar} />
            <AvatarFallback className="text-2xl">
              {targetUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left space-y-3">
            <h1 className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
              {targetUser.name}
              {targetUser.openChat && (
                <Shield
                  className="h-4 w-4 text-green-500"
                  title="Open Chat Enabled"
                />
              )}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge variant="outline" className="capitalize">
                {targetUser.role === 'contractor'
                  ? t('role.contractor')
                  : t('role.executor')}
              </Badge>
              <Badge variant="secondary" className="text-yellow-600">
                ★ {targetUser.reputation}
              </Badge>
              <Badge variant="outline">{targetUser.location}</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto sm:mx-0">
              {t('profile.verified_desc')}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button
              size="lg"
              onClick={handleAction}
              className="w-full"
              disabled={existingInterest?.status === 'pending'}
            >
              {canMessage ? (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />{' '}
                  {t('profile.send_message')}
                </>
              ) : existingInterest?.status === 'pending' ? (
                <>
                  <Heart className="mr-2 h-4 w-4" />{' '}
                  {t('profile.pending_interest')}
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />{' '}
                  {t('profile.show_interest')}
                </>
              )}
            </Button>
            {!canMessage && !existingInterest && (
              <p className="text-xs text-muted-foreground text-center max-w-[200px] mx-auto mt-2">
                {t('profile.closed_chat_desc')}
              </p>
            )}
            {isPremium && !targetUser.openChat && !existingConversation && (
              <div className="mt-2 text-center bg-primary/10 text-primary px-3 py-1.5 rounded-md text-xs font-medium border border-primary/20">
                {t('profile.premium_benefit')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {targetUser.role === 'executor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {targetUser.portfolio?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {targetUser.portfolio.map((url: string, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-md overflow-hidden border"
                      >
                        <img
                          src={url}
                          alt={`Portfolio ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-1 space-y-6">
            {targetUser.services?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {targetUser.services.map((svc: any) => (
                      <li
                        key={svc.id}
                        className="flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0"
                      >
                        <span className="font-semibold">{svc.name}</span>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{svc.unit}</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(svc.price)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
