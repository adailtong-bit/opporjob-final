import { useEffect, useState } from 'react'
import { useAdStore } from '@/stores/useAdStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Info } from 'lucide-react'
import { AdActionsMenu } from './components/AdActionsMenu'
import AdCreateDialog from './components/AdCreateDialog'
import PricingMatrixTab from './components/PricingMatrixTab'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ManageAds() {
  const { ads, checkExpirations } = useAdStore()
  const [createOpen, setCreateOpen] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguageStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      const expired = useAdStore.getState().checkExpirations()
      if (expired.length > 0) {
        expired.forEach((ad) => {
          const docName =
            ad.country === 'BR' ? 'Nota Fiscal (NF)' : 'Billing Note'
          const email =
            ad.advertiserDetails?.billingContact.email ||
            'o email de faturamento'
          toast({
            title: `Anúncio Expirado: ${ad.title}`,
            description: `A validade do anúncio expirou. ${docName} gerada e enviada automaticamente para ${email}.`,
            duration: 8000,
          })
        })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>
      case 'suspended':
        return <Badge className="bg-amber-500">Suspenso</Badge>
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.ads.title')}
        </h1>
        <p className="text-muted-foreground">{t('admin.ads.desc')}</p>
      </div>

      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ads">{t('admin.ads.tab.ads')}</TabsTrigger>
          <TabsTrigger value="matrix">{t('admin.ads.tab.matrix')}</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)}>
              {t('admin.ads.create_btn')}
            </Button>
          </div>

          <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anunciante</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Nível / Matriz</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">
                      {ad.advertiserName}
                      <div className="text-[11px] text-muted-foreground flex flex-col mt-0.5">
                        <span>
                          {ad.country === 'BR' ? 'Brasil' : ad.country}
                        </span>
                        {ad.advertiserDetails?.taxId && (
                          <span>Doc: {ad.advertiserDetails.taxId}</span>
                        )}
                        {ad.advertiserDetails?.billingContact.email && (
                          <span>
                            {ad.advertiserDetails.billingContact.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{ad.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {ad.category} | {ad.region}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline">{ad.planLevel}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" /> Peso:{' '}
                          {ad.skillWeight || 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        Início: {format(new Date(ad.startDate), 'dd/MM/yyyy')}
                      </div>
                      <div>
                        Fim: {format(new Date(ad.endDate), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {new Intl.NumberFormat(
                        ad.country === 'BR' ? 'pt-BR' : 'en-US',
                        {
                          style: 'currency',
                          currency: ad.country === 'BR' ? 'BRL' : 'USD',
                        },
                      ).format(ad.calculatedPrice || 0)}
                    </TableCell>
                    <TableCell>{getStatusBadge(ad.status)}</TableCell>
                    <TableCell className="text-right">
                      <AdActionsMenu ad={ad} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="matrix">
          <PricingMatrixTab />
        </TabsContent>
      </Tabs>

      <AdCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
