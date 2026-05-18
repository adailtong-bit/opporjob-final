import { useState } from 'react'
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
import { CheckCircle2, Play, AlertCircle, Database } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useJobStore } from '@/stores/useJobStore'

export default function ManageIntegrations() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { fetchJobs } = useJobStore()

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
          title: 'Integração Concluída',
          description: `Foram importados ${data.count} novos serviços via Apify.`,
        })
        await fetchJobs()
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

            <div className="flex items-start gap-3 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <p>
                Ao executar a coleta, a Edge Function do Supabase chamará o ator
                do Apify e salvará os novos anúncios diretamente no seu banco de
                dados.
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
                <>Processando Extração...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Executar Extração Agora
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
