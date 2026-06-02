import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Plus, Search, MapPin, MessageSquare, Tag } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function MyJobs() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()
  const { conversations } = useMessageStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const navigate = useNavigate()

  if (!user) return null

  // The "Meus Anúncios" tab must exclusively display jobs authored by the user
  const myContractedJobs = jobs.filter((j) => j.ownerId === user.id)

  // The "Meus Interesses" tab correctly groups all jobs where the user expressed interest,
  // preventing these jobs from leaking into the "Meus Anúncios" tab.
  const myInterests = jobs
    .filter((job) => {
      // Data Integrity: the user's authored jobs don't count as 'interests' here
      if (job.ownerId === user.id) return false

      const hasBidded = job.bids.some((b) => b.executorId === user.id)
      const hasChat = conversations.some(
        (c) =>
          c.context?.id === job.id &&
          c.participants.some((p) => p.id === user.id),
      )
      return hasBidded || hasChat
    })
    .map((job) => {
      const bid = job.bids.find((b) => b.executorId === user.id)
      const conv = conversations.find(
        (c) =>
          c.context?.id === job.id &&
          c.participants.some((p) => p.id === user.id),
      )

      const manifestationDate =
        bid?.createdAt || conv?.updatedAt || job.createdAt

      let interactionStatus = 'Pendente'
      let statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200'

      if (job.status !== 'open' && job.status !== 'in_progress') {
        interactionStatus = 'Indisponível / Fechado'
        statusColor = 'bg-gray-100 text-gray-800 border-gray-200'
      } else if (job.acceptedBidId) {
        if (job.acceptedBidId === bid?.id) {
          interactionStatus = 'Aceito / Contratado'
          statusColor = 'bg-green-100 text-green-800 border-green-200'
        } else {
          interactionStatus = 'Recusado'
          statusColor = 'bg-red-100 text-red-800 border-red-200'
        }
      } else if (conv && conv.negotiationStatus) {
        if (conv.negotiationStatus === 'analysis') {
          interactionStatus = 'Em Análise'
          statusColor = 'bg-blue-100 text-blue-800 border-blue-200'
        } else if (conv.negotiationStatus === 'proposal') {
          interactionStatus = 'Proposta Enviada'
          statusColor = 'bg-purple-100 text-purple-800 border-purple-200'
        } else if (conv.negotiationStatus === 'contracted') {
          interactionStatus = 'Contratado'
          statusColor = 'bg-green-100 text-green-800 border-green-200'
        }
      } else if (bid) {
        interactionStatus = 'Proposta Enviada'
        statusColor = 'bg-purple-100 text-purple-800 border-purple-200'
      }

      return {
        job,
        manifestationDate,
        interactionStatus,
        statusColor,
        convId: conv?.id,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.manifestationDate).getTime() -
        new Date(a.manifestationDate).getTime(),
    )

  // Smart default tab to improve UX for users (e.g. executors) without posted ads
  const defaultTab =
    myContractedJobs.length === 0 && myInterests.length > 0
      ? 'my-interests'
      : 'my-ads'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">{t('status.open')}</Badge>
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {t('status.in_progress')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t('status.completed')}
          </Badge>
        )
      case 'dispute':
        return <Badge variant="destructive">{t('status.dispute')}</Badge>
      default:
        return <Badge variant="outline">{t(`status.${status}`)}</Badge>
    }
  }

  const getListingTypeLabel = (type?: string) => {
    switch (type) {
      case 'product':
        return 'Desapego / Produto'
      case 'rental':
        return 'Aluguel'
      case 'community':
        return 'Doação'
      case 'job':
      default:
        return 'Vaga / Serviço'
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('sidebar.my_jobs')}
          </h1>
          <p className="text-muted-foreground">
            {t('proj.partner.manage_activities')}
          </p>
        </div>
        <Button asChild>
          <Link to="/post-job">
            <Plus className="mr-2 h-4 w-4" /> {t('dashboard.post_job')}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="my-ads">{t('home.my_ads.title')}</TabsTrigger>
          <TabsTrigger value="my-interests">
            {t('dashboard.tabs.interests')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-ads" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>{t('home.my_ads.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {myContractedJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                  <Tag className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>Você ainda não publicou nenhum anúncio.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>{t('plans.field.title')}</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>{t('plans.field.category')}</TableHead>
                        <TableHead>{t('job.budget')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('job.proposals')}</TableHead>
                        <TableHead className="text-right">
                          {t('actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myContractedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {job.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {getListingTypeLabel(job.listingType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {job.category}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatCurrency(
                              job.listingType === 'product' ||
                                job.listingType === 'community'
                                ? (job.salePrice ?? 0)
                                : job.listingType === 'rental'
                                  ? (job.rentalRate ?? 0)
                                  : (job.budget ?? 0),
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getStatusBadge(job.status)}
                          </TableCell>
                          <TableCell>{job.bids.length}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/jobs/${job.id}`}>
                                <Eye className="h-4 w-4 mr-1" /> {t('view')}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-interests" className="space-y-6 animate-fade-in">
          {myInterests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/10">
              <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Você ainda não manifestou interesse em nenhum anúncio
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Explore o marketplace para encontrar vagas, serviços, desapegos
                e muito mais.
              </p>
              <Button asChild size="lg">
                <Link to="/find-jobs">Explorar</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myInterests.map(
                ({
                  job,
                  manifestationDate,
                  interactionStatus,
                  statusColor,
                  convId,
                }) => (
                  <Card
                    key={job.id}
                    className="flex flex-col hover:border-primary/50 transition-colors overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => {
                      if (convId) navigate(`/messages?conv=${convId}`)
                      else navigate(`/jobs/${job.id}`)
                    }}
                  >
                    <div className="h-40 relative bg-muted border-b">
                      <img
                        src={
                          job.photos?.[0] ||
                          `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(job.category.toLowerCase())}`
                        }
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-2 items-start">
                        <Badge className="bg-primary text-primary-foreground shadow-sm">
                          {getListingTypeLabel(job.listingType)}
                        </Badge>
                      </div>
                      <Badge
                        variant="outline"
                        className={`absolute top-2 right-2 border font-medium shadow-sm bg-background/95 backdrop-blur-sm ${statusColor}`}
                      >
                        {interactionStatus}
                      </Badge>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg line-clamp-2 leading-tight mb-2">
                        {job.title}
                      </h3>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Manifestado em:{' '}
                          {formatDate(
                            new Date(manifestationDate),
                            'dd/MM/yyyy',
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          asChild
                        >
                          <Link
                            to={
                              convId
                                ? `/messages?conv=${convId}`
                                : `/jobs/${job.id}`
                            }
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
