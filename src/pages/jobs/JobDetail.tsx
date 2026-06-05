import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore, Job } from '@/stores/useJobStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, ArrowLeft, Star, SearchX } from 'lucide-react'
import { formatCurrencyValue } from '@/lib/utils'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguageStore()
  const { getJob, fetchJobById } = useJobStore()

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<Job | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setLoading(true)

      // Attempt to load from synchronous store state first
      let foundJob = getJob(id)

      // If it's not present (e.g., direct page load), fetch strictly by ID
      if (!foundJob) {
        foundJob = await fetchJobById(id)
      }

      if (foundJob) {
        setJob(foundJob)
        setNotFound(false)
      } else {
        setNotFound(true)
      }

      setLoading(false)
    }

    loadData()
  }, [id, getJob, fetchJobById])

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center h-[60vh] text-muted-foreground">
        {t('loading')}
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in-95 duration-300">
        <SearchX className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Oportunidade Não Encontrada</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          A oportunidade que você está tentando acessar não existe, foi removida
          ou não está disponível neste ambiente.
        </p>
        <Button onClick={() => navigate('/find-jobs')}>
          Voltar para a Busca
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4 hover:bg-transparent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
      </Button>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {job.photos && job.photos.length > 0 && (
          <div className="h-64 sm:h-80 md:h-96 w-full bg-muted relative">
            <img
              src={job.photos[0]}
              alt={job.title}
              className="w-full h-full object-cover"
            />
            {job.isDemo && (
              <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider uppercase shadow-md">
                {t('demo.badge')}
              </Badge>
            )}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{job.category}</Badge>
                {job.subCategory && (
                  <Badge variant="outline">{job.subCategory}</Badge>
                )}
                {!job.photos?.length && job.isDemo && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider uppercase">
                    {t('demo.badge')}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight text-foreground">
                {job.title}
              </h1>
            </div>
            <div className="md:text-right shrink-0">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {formatCurrencyValue(job.budget || 0)}
              </div>
              <div className="text-sm text-muted-foreground capitalize mt-1">
                {job.type === 'fixed'
                  ? t('post.pricing.fixed')
                  : t('post.pricing.negotiable')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
            {job.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Publicado em {job.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {t('job.description')}
              </h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </section>

            <section className="bg-muted/30 p-6 rounded-xl border border-border/50">
              <h3 className="font-semibold mb-4 text-foreground">
                Informações do Anunciante
              </h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {job.ownerName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-base text-foreground">
                    {job.ownerName || 'Usuário Verificado'}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>Membro da plataforma</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="w-full sm:w-auto" size="lg">
                Enviar Proposta
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" size="lg">
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
