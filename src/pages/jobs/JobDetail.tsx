import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useJobStore } from '@/stores/useJobStore'
import { useInvoices } from '@/hooks/use-invoices'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin,
  Calendar,
  DollarSign,
  Gavel,
  ShieldAlert,
  Send,
  AlertOctagon,
  CheckCircle,
  MessageSquare,
  CalendarDays,
  Settings2,
  Lock,
  Upload,
  X,
  Loader2,
  Star,
} from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getJob,
    addBid,
    completeJob,
    openDispute,
    updateJobStatus,
    finalizeJob,
  } = useJobStore()
  const { user, setPendingEvaluation } = useAuthStore()
  const {
    conversations,
    getOrCreateConversation,
    sendMessage: sendChatMessage,
  } = useMessageStore()
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const job = getJob(id!)
  const { invoices } = useInvoices(user?.id)
  const [bidAmount, setBidAmount] = useState('')
  const [bidDescription, setBidDescription] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [dbMessages, setDbMessages] = useState<any[]>([])

  const [executionPhotos, setExecutionPhotos] = useState<string[]>([])
  const [executionComments, setExecutionComments] = useState('')
  const [uploadingExecutionFiles, setUploadingExecutionFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [hasRated, setHasRated] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  const jobInvoice = invoices.find(
    (inv) => inv.job_id === job?.id && inv.type === 'service',
  )

  useEffect(() => {
    const checkReview = async () => {
      if (user && job?.id) {
        const { data } = await supabase
          .from('reviews')
          .select('id')
          .eq('job_id', job.id)
          .eq('reviewer_id', user.id)
          .maybeSingle()
        if (data) {
          setHasRated(true)
        }
      }
    }
    checkReview()
  }, [user, job?.id])

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      toast({ variant: 'destructive', title: 'Select 1 to 5 stars' })
      return
    }
    setSubmittingRating(true)
    const targetId = acceptedBid?.executorId || ''
    const { error } = await supabase.from('reviews').insert({
      job_id: job!.id,
      reviewer_id: user!.id,
      target_id: targetId,
      rating,
      comment: ratingComment,
    })

    setSubmittingRating(false)
    if (!error) {
      setHasRated(true)
      toast({ title: t('job.rating.thank_you') })
    } else {
      toast({ variant: 'destructive', title: 'Error' })
    }
  }

  if (!job)
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('job.not_found')}
      </div>
    )

  const isJobListing =
    !job.listingType ||
    job.listingType === 'job' ||
    job.listingType === 'service'
  const isOwner = user?.id === job.ownerId
  const hasBidded = user
    ? job.bids.some((b) => b.executorId === user.id)
    : false
  const acceptedBid = job.acceptedBidId
    ? job.bids.find((b) => b.id === job.acceptedBidId)
    : null
  const isExecutor = user ? acceptedBid?.executorId === user.id : false
  const canViewChat = user && (isOwner || isExecutor)

  const lowestBid =
    job.bids.length > 0
      ? Math.min(...job.bids.map((b) => b.amount))
      : (job.budget ?? 0)

  const existingConv = user
    ? conversations.find(
        (c) =>
          c.context?.id === job.id &&
          c.participants.some((p) => p.id === user.id),
      )
    : undefined

  const hasInteracted = !!existingConv

  const handleBid = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/jobs/${job.id}` } })
      return
    }
    if (!bidAmount || !bidDescription) return

    const amount = Number(bidAmount)

    if (job.type === 'auction') {
      if (amount >= lowestBid) {
        toast({
          variant: 'destructive',
          title: 'Lance inválido',
          description: `${t('job.auction_warning')} ${formatCurrency(lowestBid)}`,
        })
        return
      }
    }

    addBid(job.id, {
      jobId: job.id,
      executorId: user.id,
      executorName: user.name,
      amount: amount,
      description: bidDescription,
      executorReputation: user.reputation,
    })

    addNotification({
      userId: job.ownerId,
      title: 'Novo Lance Recebido!',
      message: `Você recebeu um lance de ${formatCurrency(amount)} no anúncio "${job.title}".`,
      type: 'info',
      link: `/jobs/${job.id}`,
    })

    const convId = getOrCreateConversation(
      { id: user.id, name: user.name, avatar: user.avatar || '' },
      {
        id: job.ownerId,
        name: job.ownerName,
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${job.ownerId}`,
      },
      { type: 'job', id: job.id, title: job.title },
    )
    sendChatMessage(
      convId,
      user.id,
      `Enviei uma proposta de ${formatCurrency(amount)}:\n${bidDescription}`,
    )

    toast({
      title: 'Lance/Proposta enviado!',
      description: 'O anunciante será notificado e uma conversa foi iniciada.',
    })
    setBidAmount('')
    setBidDescription('')
  }

  const handleContact = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/jobs/${job.id}` } })
      return
    }
    const convId = getOrCreateConversation(
      { id: user.id, name: user.name, avatar: user.avatar || '' },
      {
        id: job.ownerId,
        name: job.ownerName,
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${job.ownerId}`,
      },
      { type: 'job', id: job.id, title: job.title },
      'analysis',
    )
    navigate(`/messages?conv=${convId}`)
  }

  const handleAcceptBid = (bidId: string) => {
    navigate(`/payment/checkout/${job.id}/${bidId}`)
  }

  const handleComplete = () => {
    if (!user) return
    setPendingEvaluation({
      jobId: job.id,
      targetId: acceptedBid?.executorId || '',
      targetName: acceptedBid?.executorName || '',
      type: 'contractor_to_executor',
    })

    completeJob(job.id)
    toast({
      title: 'Finalizado',
      description: 'Por favor, avalie a contraparte para liberar o pagamento.',
    })
  }

  const handleDispute = () => {
    openDispute(job.id)
    navigate(`/disputes/new/${job.id}`)
  }

  const handleSendMessage = async () => {
    if (!user || !chatMessage.trim()) return

    const msg = chatMessage.trim()
    setChatMessage('')

    await supabase.from('job_messages' as any).insert({
      job_id: job.id,
      sender_id: user.id,
      content: msg,
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Disponível'
      case 'in_progress':
        return 'Em Negociação'
      case 'completed':
        return 'Fechado'
      default:
        return status
    }
  }

  const getListingTypeLabel = (type?: string) => {
    switch (type) {
      case 'product':
        return 'Produto Novo'
      case 'desapego':
        return 'Desapego / Usado'
      case 'rental':
        return 'Aluguel'
      case 'community':
      case 'donation':
        return 'Comunidade / Doação'
      case 'job':
        return 'Vaga'
      case 'service':
        return 'Serviço'
      default:
        return 'Vaga / Serviço'
    }
  }

  let displayPrice = job.budget || 0
  if (job.listingType === 'product' && job.salePrice)
    displayPrice = job.salePrice
  if (job.listingType === 'rental' && job.rentalRate)
    displayPrice = job.rentalRate

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 lg:pb-10 p-4 md:p-8 pt-6 animate-fade-in w-full">
      {(job as any).is_demo && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-md flex items-center gap-3 shadow-sm mb-4">
          <Star className="h-5 w-5 text-amber-600" />
          <p className="text-sm font-medium">
            {t('demo.notification') ||
              'This is a demonstration listing to showcase platform features.'}
          </p>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary text-primary">
              {getListingTypeLabel(job.listingType)}
            </Badge>
            <Badge>{job.category}</Badge>
            <Badge
              variant={
                job.status === 'open'
                  ? 'default'
                  : job.status === 'completed'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {getStatusLabel(job.status)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold flex flex-wrap items-center gap-2 sm:gap-3">
            {job.title}
            {(job as any).is_demo && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider text-[10px] uppercase">
                {t('demo.badge') || 'DEMO'}
              </Badge>
            )}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Publicado:{' '}
              {formatDate(job.publicationDate, 'MM/dd/yyyy')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
          <div className="text-left md:text-right">
            <div className="text-sm text-muted-foreground">
              {job.type === 'auction'
                ? 'Orçamento Inicial'
                : isJobListing
                  ? 'Preço / Orçamento'
                  : 'Valor'}
            </div>
            <div className="text-2xl font-bold text-primary">
              {displayPrice === 0 ? 'Grátis' : formatCurrency(displayPrice)}
            </div>
            {job.type === 'auction' && job.bids.length > 0 && (
              <div className="text-xs font-semibold text-emerald-600">
                Melhor Oferta: {formatCurrency(lowestBid)}
              </div>
            )}
            {job.listingType === 'rental' && job.rentalRateType && (
              <div className="text-xs text-muted-foreground flex items-center justify-start md:justify-end gap-1 mt-1">
                <CalendarDays className="h-3 w-3" />
                {job.rentalRateType === 'daily' ? 'Por Dia' : 'Por Mês'}
              </div>
            )}
            {isJobListing && (
              <div className="text-xs text-muted-foreground flex items-center justify-start md:justify-end gap-1 mt-1">
                {job.type === 'auction' ? (
                  <Gavel className="h-3 w-3" />
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
                {job.type === 'auction' ? 'Leilão Reverso' : 'Preço Fixo'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {job.photos && job.photos.length > 0 && (
            <Card className="overflow-hidden">
              <img
                src={job.photos[0]}
                alt={job.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              {job.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4 bg-muted/20">
                  {job.photos.slice(1).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-primary shadow-sm bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" /> Gerenciar
                  Status
                </CardTitle>
                <CardDescription>
                  Altere o status manualmente se necessário.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={job.status === 'open' ? 'default' : 'outline'}
                    onClick={() => updateJobStatus(job.id, 'open')}
                    className={
                      job.status === 'open' ? 'pointer-events-none' : ''
                    }
                  >
                    Aberto / Disponível
                  </Button>
                  <Button
                    variant={
                      job.status === 'in_progress' ? 'default' : 'outline'
                    }
                    onClick={() => updateJobStatus(job.id, 'in_progress')}
                    className={
                      job.status === 'in_progress'
                        ? 'bg-blue-600 hover:bg-blue-700 pointer-events-none'
                        : ''
                    }
                  >
                    Em Negociação
                  </Button>
                  <Button
                    variant={job.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => updateJobStatus(job.id, 'completed')}
                    className={
                      job.status === 'completed'
                        ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground pointer-events-none'
                        : ''
                    }
                  >
                    Fechado / Indisponível
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isOwner && job.status === 'completed' && job.completionComments && (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />{' '}
                  {t('job.execution.review_evidence')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-900">
                    {t('job.execution.provider_comments')}
                  </p>
                  <p className="text-sm text-emerald-900 whitespace-pre-line bg-white/50 p-3 rounded-md border border-emerald-100 shadow-sm">
                    {job.completionComments}
                  </p>
                </div>

                {job.completionPhotos && job.completionPhotos.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-900">
                      {t('job.execution.completion_photos')}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {job.completionPhotos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={photo}
                            alt={`Completion ${i}`}
                            className="w-full aspect-square object-cover rounded border border-emerald-100 hover:opacity-80 transition-opacity shadow-sm"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-emerald-200/60 mt-4 flex flex-col gap-4">
                  {jobInvoice && jobInvoice.status !== 'paid' ? (
                    <Button asChild className="w-full sm:w-auto self-start">
                      <Link
                        to={`/payment/checkout/${job.id}/${acceptedBid?.id}`}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />{' '}
                        {t('job.action.pay_invoice')}
                      </Link>
                    </Button>
                  ) : jobInvoice &&
                    jobInvoice.status === 'paid' &&
                    !hasRated ? (
                    <div className="bg-white p-5 rounded-lg border border-emerald-100 shadow-sm space-y-4 animate-fade-in-up">
                      <h4 className="font-semibold text-emerald-900 text-lg">
                        {t('job.rating.title')}
                      </h4>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`hover:scale-110 transition-transform focus:outline-none`}
                          >
                            <Star
                              className={`h-8 w-8 ${
                                rating >= star
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        placeholder={t('job.rating.comment')}
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className="bg-white resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={handleSubmitRating}
                        disabled={submittingRating || rating === 0}
                        className="w-full sm:w-auto"
                      >
                        {t('job.rating.submit')}
                      </Button>
                    </div>
                  ) : hasRated ? (
                    <div className="bg-white p-4 rounded-lg border border-emerald-100 flex items-center gap-3 text-emerald-700 shadow-sm font-medium animate-fade-in">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                      {t('job.rating.thank_you')}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          {isExecutor &&
            job.status === 'completed' &&
            job.completionComments && (
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardHeader>
                  <CardTitle className="text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />{' '}
                    {t('job.execution.completed_details')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-emerald-900 whitespace-pre-line bg-white/50 p-3 rounded-md border border-emerald-100 shadow-sm">
                    {job.completionComments}
                  </p>
                  {job.completionPhotos && job.completionPhotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {job.completionPhotos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={photo}
                            alt={`Completion ${i}`}
                            className="w-full aspect-square object-cover rounded border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {isExecutor && job.status === 'in_progress' && (
            <Card className="border-primary shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle>{t('job.execution.workspace')}</CardTitle>
                <CardDescription>
                  {t('job.execution.finalize_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('job.execution.comments')}
                  </label>
                  <Textarea
                    placeholder={t('job.execution.comments_placeholder')}
                    value={executionComments}
                    onChange={(e) => setExecutionComments(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('job.execution.photos')}
                  </label>
                  {executionPhotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2">
                      {executionPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
                        >
                          <img
                            src={photo}
                            alt="Upload preview"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setExecutionPhotos((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingExecutionFiles ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {t('job.execution.upload_photos')}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files || e.target.files.length === 0)
                          return
                        const files = Array.from(e.target.files)
                        setUploadingExecutionFiles(true)
                        const newPhotos: string[] = []
                        for (const file of files) {
                          if (!file.type.startsWith('image/')) continue
                          const fileExt = file.name.split('.').pop()
                          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
                          const filePath = `${user?.id || 'guest'}/${fileName}`
                          const { error } = await supabase.storage
                            .from('project-images')
                            .upload(filePath, file)
                          if (!error) {
                            const { data } = supabase.storage
                              .from('project-images')
                              .getPublicUrl(filePath)
                            newPhotos.push(data.publicUrl)
                          }
                        }
                        setExecutionPhotos((prev) => [...prev, ...newPhotos])
                        setUploadingExecutionFiles(false)
                      }}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={
                    uploadingExecutionFiles || !executionComments.trim()
                  }
                  onClick={async () => {
                    if (!executionComments.trim()) {
                      toast({
                        variant: 'destructive',
                        title: t('val.required'),
                      })
                      return
                    }
                    await finalizeJob(job.id, {
                      completionPhotos: executionPhotos,
                      completionComments: executionComments,
                    })
                    toast({ title: t('job.execution.success') })
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />{' '}
                  {t('job.execution.finalize')}
                </Button>
              </CardContent>
            </Card>
          )}

          {isOwner && job.status === 'open' && isJobListing && (
            <Card>
              <CardHeader>
                <CardTitle>Propostas Recebidas ({job.bids.length})</CardTitle>
                <CardDescription>
                  {job.type === 'auction'
                    ? 'Acompanhe os lances do leilão.'
                    : 'Escolha a melhor proposta ou comprador/locatário.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.bids.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhuma proposta recebida ainda.
                  </div>
                ) : (
                  job.bids
                    .sort((a, b) => a.amount - b.amount)
                    .map((bid) => (
                      <div
                        key={bid.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-start bg-card/50"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {bid.executorName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-yellow-600 border-yellow-200 bg-yellow-50"
                            >
                              ★ {bid.executorReputation.toFixed(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bid.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(bid.createdAt, 'MM/dd/yyyy hh:mm a')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                          <span className="text-xl font-bold text-primary">
                            {formatCurrency(bid.amount)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBid(bid.id)}
                          >
                            Aceitar e Pagar
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          )}

          {(job.status === 'suspended' ||
            job.status === 'in_progress' ||
            job.status === 'completed' ||
            job.status === 'dispute') &&
            canViewChat && (
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" /> Sala de Chat Segura
                    </span>
                    {job.status !== 'completed' &&
                      job.status !== 'cancelled' && (
                        <Badge className="bg-indigo-500 hover:bg-indigo-600">
                          Protegido: {formatCurrency(acceptedBid?.amount || 0)}
                        </Badge>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-background flex flex-col">
                    <div className="flex items-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                        <p className="text-sm">
                          Chat seguro iniciado. O pagamento está protegido em
                          Escrow.
                        </p>
                      </div>
                    </div>
                    {dbMessages.map((msg) => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {isMe ? 'Você' : msg.sender?.name || 'Usuário'} •{' '}
                            {formatDate(msg.created_at, 'hh:mm a')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Mensagem..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSendMessage()
                      }
                      disabled={
                        job.status === 'completed' || job.status === 'dispute'
                      }
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={
                        job.status === 'completed' || job.status === 'dispute'
                      }
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col md:flex-row justify-between bg-muted/30 p-4 border-t gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 border-destructive/20 w-full md:w-auto"
                    onClick={handleDispute}
                    disabled={
                      job.status === 'completed' || job.status === 'dispute'
                    }
                  >
                    <AlertOctagon className="mr-2 h-4 w-4" /> Abrir Disputa
                  </Button>

                  {isOwner &&
                    (job.status === 'suspended' ||
                      job.status === 'in_progress') && (
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto"
                        onClick={handleComplete}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Concluir
                      </Button>
                    )}
                </CardFooter>
              </Card>
            )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          {!isOwner && (
            <Card
              id="interaction-card"
              className="transition-all duration-300 shadow-md border-primary/10"
            >
              <CardHeader>
                <CardTitle>
                  {isJobListing
                    ? 'Interagir / Proposta'
                    : 'Conversar com o Anunciante'}
                </CardTitle>
                {job.type === 'auction' &&
                  isJobListing &&
                  job.status === 'open' && (
                    <CardDescription className="text-amber-600 font-medium">
                      Aviso: A oferta deve ser menor que{' '}
                      {formatCurrency(lowestBid)}
                    </CardDescription>
                  )}
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="flex flex-col items-center text-center p-6 border-2 border-dashed rounded-xl bg-muted/30 space-y-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                      <Lock className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        Faça login para interagir
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Você precisa ter uma conta para enviar propostas ou
                        conversar com o anunciante.
                      </p>
                    </div>
                    <div className="w-full flex flex-col gap-3 pt-2">
                      <Button asChild className="w-full">
                        <Link to={`/login?redirect=/jobs/${job.id}`}>
                          Fazer Login
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/register">Criar Conta Grátis</Link>
                      </Button>
                    </div>
                  </div>
                ) : job.status !== 'open' ? (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                    <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Este anúncio já foi fechado ou está indisponível.</p>
                  </div>
                ) : hasBidded ? (
                  <div className="text-center py-6 border rounded-lg bg-muted/10">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Proposta Enviada</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aguarde o retorno do contratante.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/my-jobs')}
                    >
                      Acompanhar Proposta
                    </Button>
                  </div>
                ) : isJobListing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor (R$)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        max={job.type === 'auction' ? lowestBid - 1 : undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mensagem</label>
                      <Textarea
                        placeholder="Descreva sua proposta ou dúvidas..."
                        value={bidDescription}
                        onChange={(e) => setBidDescription(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" size="lg" onClick={handleBid}>
                      Enviar Proposta
                    </Button>
                  </>
                ) : (
                  <div className="pt-2">
                    {hasInteracted && existingConv ? (
                      <div className="text-center py-4 border rounded-lg bg-muted/10 space-y-3">
                        <MessageSquare className="h-6 w-6 mx-auto text-primary" />
                        <p className="font-medium">Conversa Iniciada</p>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            navigate(`/messages?conv=${existingConv.id}`)
                          }
                        >
                          Ver Mensagens
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleContact}
                      >
                        <MessageSquare className="mr-2 h-5 w-5" /> Tenho
                        Interesse
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Transação Segura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-blue-700">
              <p>
                As interações na plataforma são protegidas. Sempre negocie e
                feche o pagamento através do sistema Escrow do BIDWORK para
                garantir sua segurança.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {!isOwner && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 lg:hidden flex items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {job.title}
            </p>
            <p className="font-bold text-primary truncate">
              {displayPrice === 0 ? 'Grátis' : formatCurrency(displayPrice)}
            </p>
          </div>
          <div>
            {!user ? (
              <Button asChild size="sm">
                <Link to={`/login?redirect=/jobs/${job.id}`}>Fazer Login</Link>
              </Button>
            ) : job.status !== 'open' ? (
              <Button disabled size="sm" variant="secondary">
                Indisponível
              </Button>
            ) : hasBidded ? (
              <Button
                disabled
                size="sm"
                variant="outline"
                className="border-green-500 text-green-600"
              >
                Enviada
              </Button>
            ) : hasInteracted && existingConv && !isJobListing ? (
              <Button size="sm" asChild>
                <Link to={`/messages?conv=${existingConv.id}`}>Ver Chat</Link>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  document.getElementById('interaction-card')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                  const card = document.getElementById('interaction-card')
                  if (card) {
                    card.classList.add(
                      'ring-2',
                      'ring-primary',
                      'ring-offset-2',
                    )
                    setTimeout(() => {
                      card.classList.remove(
                        'ring-2',
                        'ring-primary',
                        'ring-offset-2',
                      )
                    }, 1500)
                  }
                }}
              >
                {isJobListing ? 'Fazer Proposta' : 'Tenho Interesse'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
