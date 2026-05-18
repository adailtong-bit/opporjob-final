import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Play,
  AlertCircle,
  Database,
  Trash2,
  Check,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useJobStore } from '@/stores/useJobStore'
import type { Database as DB } from '@/lib/supabase/types'

type Job = DB['public']['Tables']['jobs']['Row']

export default function ManageIntegrations() {
  const [loading, setLoading] = useState(false)
  const [pendingJobs, setPendingJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const { toast } = useToast()
  const { fetchJobs } = useJobStore()

  const fetchPendingJobs = async () => {
    setLoadingJobs(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('source', 'apify')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingJobs(data || [])
    } catch (err: any) {
      console.error('Error fetching pending jobs:', err)
    } finally {
      setLoadingJobs(false)
    }
  }

  useEffect(() => {
    fetchPendingJobs()
  }, [])

  const handleRunApify = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        'apify-import',
        {},
      )

      if (error) throw error

      if (data?.success) {
        toast({
          title: 'Extração Concluída',
          description: `Foram importados ${data.count} anúncios para a área de análise.`,
        })
        await fetchPendingJobs()
      } else {
        throw new Error(data?.error || 'Erro desconhecido')
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na Integração',
        description: err.message || 'Não foi possível conectar com o Apify.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'open' })
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Anúncio Aprovado',
        description: 'O anúncio foi publicado com sucesso no marketplace.',
      })

      setPendingJobs((prev) => prev.filter((job) => job.id !== id))
      await fetchJobs()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao aprovar',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDiscard = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id)

      if (error) throw error

      toast({
        title: 'Anúncio Descartado',
        description: 'O anúncio foi removido permanentemente.',
      })

      setPendingJobs((prev) => prev.filter((job) => job.id !== id))
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao descartar',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Integrações de Dados
        </h1>
        <p className="text-muted-foreground">
          Gerencie a coleta automatizada de serviços e produtos de outras
          plataformas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Apify Scraper
              </CardTitle>
              <Badge className="bg-green-500">Conectado</Badge>
            </div>
            <CardDescription>
              Integração ativa utilizando API Key. Extrai dados automaticamente
              de marketplaces como OfferUp e Craigslist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status da API</span>
                <span className="flex items-center gap-1 font-medium text-green-600">
                  <CheckCircle2 className="w-4 h-4" /> Operacional
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Última Sincronização
                </span>
                <span className="font-medium">Nunca</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Chave Configurada</span>
                <span className="font-medium">apify_api_***RqDK</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-100 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p>
                Os anúncios extraídos serão enviados para a{' '}
                <strong>Área de Análise</strong> abaixo, onde você poderá
                aprovar ou descartar antes de publicá-los.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleRunApify}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando Extração...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Executar Extração Agora
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Área de Análise (Staging)
            </h2>
            <p className="text-muted-foreground">
              Revise os anúncios importados antes de publicá-los.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingJobs}
            disabled={loadingJobs}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loadingJobs ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>

        {loadingJobs ? (
          <div className="text-center py-10">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">
              Carregando anúncios pendentes...
            </p>
          </div>
        ) : pendingJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">
                Nenhum anúncio pendente de aprovação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-4 items-center flex-1">
                      {job.photos &&
                      Array.isArray(job.photos) &&
                      job.photos.length > 0 ? (
                        <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-muted">
                          <img
                            src={job.photos[0] as string}
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                          <span className="text-xs text-muted-foreground">
                            Sem Foto
                          </span>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">
                            {job.category || 'Sem Categoria'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-green-600 bg-green-50 dark:bg-green-950"
                          >
                            {job.budget ? `$${job.budget}` : 'Preço a combinar'}
                          </Badge>
                          <span className="text-xs text-muted-foreground self-center">
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleDiscard(job.id)}
                        disabled={processingId === job.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Descartar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(job.id)}
                        disabled={processingId === job.id}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
