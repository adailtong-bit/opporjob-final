import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/SafeImage'
import { Plus, MessageSquare, MapPin, Eye, BarChart } from 'lucide-react'

export default function MyJobs() {
  const { user } = useAuthStore()
  const { jobs, fetchJobs } = useJobStore()
  const { t, formatDate } = useLanguageStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ads')

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  if (!user) return null

  const myAds = jobs.filter((j) => j.ownerId === user.id)
  const receivedBids = jobs.filter(
    (j) => j.ownerId === user.id && j.bids && j.bids.length > 0,
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {t('sidebar.my_jobs', { defaultValue: 'Minhas Atividades' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('partner.jobs.desc', {
              defaultValue: 'Gerencie as atividades de seus projetos.',
            })}
          </p>
        </div>
        <Button onClick={() => navigate('/post-job')} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />{' '}
          {t('dashboard.post_job', { defaultValue: 'Publicar Novo Job' })}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="ads">
            {t('home.my_ads.title', { defaultValue: 'Meus Anúncios' })}
          </TabsTrigger>
          <TabsTrigger value="interests">
            {t('dashboard.tabs.interests', {
              defaultValue: 'Interesses Recebidos',
            })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4">
          {myAds.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('partner.jobs.no_jobs', {
                    defaultValue: 'Nenhum trabalho publicado.',
                  })}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Crie seu primeiro anúncio para começar a receber propostas e
                  interesses.
                </p>
                <Button onClick={() => navigate('/post-job')}>
                  {t('dashboard.post_job', {
                    defaultValue: 'Publicar Novo Job',
                  })}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAds.map((job) => {
                const rawType = (job.listingType || 'job')
                  .toLowerCase()
                  .replace('post.type.', '')
                  .replace('.label', '')
                const translatedType =
                  t(`post.type.${rawType}.label`) ||
                  t(`post.type.${rawType}`) ||
                  job.listingType

                const hasBids = job.bids && job.bids.length > 0

                return (
                  <Card
                    key={job.id}
                    className="overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="relative aspect-[4/3] bg-muted">
                      <SafeImage
                        src={job.photos?.[0]}
                        alt={job.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                        <Badge
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 shadow-sm capitalize"
                        >
                          {translatedType}
                        </Badge>
                        {hasBids && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 shadow-sm"
                          >
                            {t('job.proposals', {
                              defaultValue: 'Proposta Enviada',
                            })}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg line-clamp-1 mb-1">
                        {job.title}
                      </h3>
                      {job.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <Eye className="h-3 w-3" />{' '}
                            {t('job.stats.views', {
                              defaultValue: 'Visualizações',
                            })}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {job.viewsCount || 0}
                          </span>
                        </div>
                        <div className="flex flex-col border-l pl-2">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                            <BarChart className="h-3 w-3" /> Exposição
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {job.impressionsCount || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <span>
                          Manifestado em:{' '}
                          {formatDate(job.createdAt, 'dd/MM/yyyy')}
                        </span>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          {receivedBids.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('messages.empty_interests', {
                    defaultValue: 'Nenhum interesse recebido.',
                  })}
                </h3>
                <p className="text-muted-foreground">
                  Quando alguém demonstrar interesse ou enviar uma proposta para
                  seus anúncios, ela aparecerá aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedBids.map((job) => (
                <Card
                  key={job.id}
                  className="overflow-hidden hover:shadow-md transition-all"
                >
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg line-clamp-1 mb-2">
                      {job.title}
                    </h3>
                    <div className="space-y-3">
                      {job.bids?.map((bid) => (
                        <div
                          key={bid.id}
                          className="p-3 bg-muted rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {bid.executorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(bid.createdAt, 'PP')}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            Ver Proposta
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
