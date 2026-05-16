import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Heart,
  Shield,
  ArrowLeft,
  Star,
  ShoppingCart,
  Send,
  MoreVertical,
  Flag,
  Ban,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

function PortfolioCarousel({ photos }: { photos: string[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  ])

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex -ml-4">
        {photos.map((url, idx) => (
          <div
            key={idx}
            className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] pl-4"
          >
            <div className="aspect-square rounded-md overflow-hidden border">
              <img
                src={url}
                alt={`Portfolio ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewComment, setNewReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

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

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(
            'id, rating, comment, created_at, reviewer:profiles!reviewer_id(id, name, avatar_url)',
          )
          .eq('target_id', id)
          .order('created_at', { ascending: false })

        const calculatedReputation =
          reviewsData && reviewsData.length > 0
            ? (
                reviewsData.reduce((acc, r) => acc + Number(r.rating), 0) /
                reviewsData.length
              ).toFixed(1)
            : '5.0'

        setTargetUser({
          id: data.id,
          name: data.name || data.company_name || 'Professional',
          avatar:
            data.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`,
          openChat: true, // Assuming default open chat for simplicity
          role: data.role || 'executor',
          reputation: calculatedReputation,
          location:
            data.city && data.state
              ? `${data.city} - ${data.state}`
              : 'Location unknown',
          portfolio: data.portfolio_photos || [],
          services: data.priced_services || [],
          reviews: reviewsData || [],
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleSubmitReview = async () => {
    if (!user || !id) return
    setSubmittingReview(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        reviewer_id: user.id,
        target_id: id,
        rating: newReviewRating,
        comment: newReviewComment,
      })
      if (error) throw error

      toast({ title: 'Avaliação enviada com sucesso!' })
      setNewReviewComment('')

      // Simulate Notification to the professional
      useNotificationStore.getState().addNotification({
        userId: id,
        title: 'Nova Avaliação',
        message: `${user.name} deixou uma avaliação de ${newReviewRating} estrelas no seu perfil.`,
        type: 'info',
        link: `/profile/${id}`,
      })

      // Refresh target user
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(
          'id, rating, comment, created_at, reviewer:profiles!reviewer_id(id, name, avatar_url)',
        )
        .eq('target_id', id)
        .order('created_at', { ascending: false })

      const calculatedReputation =
        reviewsData && reviewsData.length > 0
          ? (
              reviewsData.reduce((acc, r) => acc + Number(r.rating), 0) /
              reviewsData.length
            ).toFixed(1)
          : '5.0'

      setTargetUser((prev: any) => ({
        ...prev,
        reviews: reviewsData || [],
        reputation: calculatedReputation,
      }))
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar avaliação',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleBookService = (svc: any) => {
    navigate(
      `/payment/service/${id}?service=${encodeURIComponent(svc.name)}&price=${svc.price}`,
    )
  }

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
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">{t('profile.public_title')}</h2>
          <p className="text-muted-foreground">{t('profile.public_desc')}</p>
          <Button onClick={() => navigate('/settings')}>
            {t('profile.go_settings')}
          </Button>
        </div>

        <Card className="mt-8 border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="w-5 h-5" />
              Selo de Verificação de Identidade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Aumente suas chances de ser contratado! Profissionais com
              identidade verificada recebem até 3x mais contatos na plataforma.
              Envie uma foto do seu documento oficial para receber o selo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-muted/20">
              <div className="h-16 w-24 bg-slate-200 rounded-md border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-semibold text-sm">
                  Status: Não Verificado
                </h4>
                <p className="text-xs text-muted-foreground">
                  Nenhum documento enviado ainda.
                </p>
              </div>
              <Button
                onClick={() => {
                  toast({
                    title: 'Upload iniciado',
                    description: 'Por favor, selecione seu documento.',
                  })
                }}
              >
                Enviar Documento
              </Button>
            </div>
          </CardContent>
        </Card>
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
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsSaved(!isSaved)
              toast({
                title: isSaved
                  ? 'Removido dos favoritos'
                  : 'Salvo nos favoritos!',
              })
            }}
          >
            <Heart
              className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  toast({
                    title: 'Usuário denunciado',
                    description: 'Nossa equipe irá analisar este perfil.',
                  })
                }
              >
                <Flag className="mr-2 h-4 w-4" /> Denunciar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() =>
                  toast({
                    title: 'Usuário bloqueado',
                    description: 'Você não verá mais mensagens deste usuário.',
                  })
                }
              >
                <Ban className="mr-2 h-4 w-4" /> Bloquear
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
              {targetUser.document !== null && (
                <Badge
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1 ml-2"
                >
                  <Shield className="h-3 w-3" /> Verificado
                </Badge>
              )}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online
              </div>
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
                  <PortfolioCarousel photos={targetUser.portfolio} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && user.id !== id && (
                  <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                    <h4 className="font-semibold text-sm">
                      Deixe sua avaliação
                    </h4>
                    <div className="flex gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 cursor-pointer hover:scale-110 transition-transform ${i < newReviewRating ? 'fill-current' : 'text-gray-300'}`}
                          onClick={() => setNewReviewRating(i + 1)}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Como foi o serviço prestado?"
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? (
                        'Enviando...'
                      ) : (
                        <>
                          Enviar Avaliação <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {targetUser.reviews && targetUser.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {targetUser.reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback>
                              {review.reviewer?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">
                              {review.reviewer?.name || 'Anonymous'}
                            </p>
                            <div className="flex text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? 'fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-foreground/90">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md">
                    No reviews yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
            {targetUser.services?.length > 0 && (
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Serviços e Preços</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {targetUser.services.map((svc: any) => (
                      <li
                        key={svc.id}
                        className="flex flex-col gap-2 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-semibold block">
                              {svc.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {svc.unit}
                            </span>
                          </div>
                          <span className="font-bold text-primary">
                            {formatCurrency(svc.price)}
                          </span>
                        </div>
                        {user && user.id !== id && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-1 border-primary/50 text-primary hover:bg-primary/5"
                            onClick={() => handleBookService(svc)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" /> Solicitar
                            / Reservar
                          </Button>
                        )}
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
