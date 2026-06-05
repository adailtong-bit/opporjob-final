import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SafeImage } from '@/components/SafeImage'
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Eye,
  BarChart,
  ArrowLeft,
} from 'lucide-react'
import { formatCurrencyValue } from '@/lib/utils'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const { getJob } = useJobStore()
  const { t, formatDate } = useLanguageStore()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    if (id) {
      const foundJob = getJob(id)
      if (foundJob) {
        setJob(foundJob)
      }
    }
  }, [id, getJob])

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">
          {t('job.not_found', { defaultValue: 'Job not found.' })}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />{' '}
          {t('back', { defaultValue: 'Back' })}
        </Button>
      </div>
    )
  }

  const rawType = (job.listingType || 'job')
    .toLowerCase()
    .replace('post.type.', '')
    .replace('.label', '')

  const translatedType =
    t(`post.type.${rawType}.label`) ||
    t(`post.type.${rawType}`) ||
    job.listingType

  const price =
    job.listingType === 'product' || job.listingType === 'community'
      ? (job.salePrice ?? job.budget)
      : job.listingType === 'rental'
        ? (job.rentalRate ?? job.budget)
        : job.budget

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />{' '}
        {t('back', { defaultValue: 'Back' })}
      </Button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="capitalize">
                {translatedType}
              </Badge>
              {job.category && <Badge variant="outline">{job.category}</Badge>}
              <Badge
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                {t(`status.${job.status || 'open'}`)}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {job.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              )}
              {job.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('job.published', { defaultValue: 'Published on' })}:{' '}
                  {formatDate(job.createdAt, 'PP')}
                </div>
              )}
            </div>
          </div>

          {job.photos && job.photos.length > 0 && (
            <div className="rounded-xl overflow-hidden border bg-muted aspect-video md:aspect-[21/9] relative">
              <SafeImage
                src={job.photos[0]}
                alt={job.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold">
              {t('job.description', { defaultValue: 'Description' })}
            </h2>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] space-y-6">
          <Card className="shadow-sm border-primary/10">
            <CardContent className="p-6">
              <div className="space-y-2 mb-6 text-center lg:text-left">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {price === 0
                    ? t('post.free_help', { defaultValue: 'Free' })
                    : t('job.budget', { defaultValue: 'Estimated Budget' })}
                </p>
                <div className="text-4xl font-bold text-primary">
                  {price === 0
                    ? t('job.premium.free', { defaultValue: 'Gratis' })
                    : formatCurrencyValue(price, job.currency || 'USD')}
                </div>
                {job.type === 'fixed' && (
                  <p className="text-xs text-muted-foreground">
                    {t('job.fixed_price', { defaultValue: 'Fixed Price' })}
                  </p>
                )}
              </div>

              <Button className="w-full h-12 text-lg font-semibold mb-3">
                {t('job.make_offer', { defaultValue: 'Make Offer' })}
              </Button>
              <Button variant="outline" className="w-full h-12">
                {t('messages.open_chat', { defaultValue: 'Open Chat' })}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm">
            <CardContent className="p-5 flex gap-4">
              <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="space-y-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  {t('job.safe_transaction', {
                    defaultValue: 'Transação Segura',
                  })}
                </h3>
                <p className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-snug">
                  {t('job.safe_transaction_desc', {
                    defaultValue:
                      'As interações na plataforma são protegidas. Sempre negocie e feche o pagamento através do sistema Escrow do OPPORJOB para garantir sua segurança.',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart className="h-5 w-5 text-muted-foreground" />
                {t('job.stats.title', {
                  defaultValue: 'Estatísticas do Anúncio',
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t('job.stats.views', { defaultValue: 'Visualizações' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-xl font-semibold">
                      {job.viewsCount || 0}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {t('job.stats.impressions', {
                      defaultValue: 'Nível de Exposição',
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-primary" />
                    <span className="text-xl font-semibold">
                      {job.impressionsCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
