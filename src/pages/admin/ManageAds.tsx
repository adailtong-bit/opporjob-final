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
          const docName = 'Billing Note'
          const email =
            ad.advertiserDetails?.billingContact.email || 'billing email'
          toast({
            title: `Ad Expired: ${ad.title}`,
            description: `Ad validity expired. ${docName} generated and sent automatically to ${email}.`,
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
        return <Badge className="bg-green-500">Active</Badge>
      case 'suspended':
        return <Badge className="bg-amber-500">Suspended</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge className="capitalize">{status}</Badge>
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
                  <TableHead>Advertiser</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Level / Matrix</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                          <Info className="h-3 w-3" /> Weight:{' '}
                          {ad.skillWeight || 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        Start: {format(new Date(ad.startDate), 'MM/dd/yyyy')}
                      </div>
                      <div>
                        End: {format(new Date(ad.endDate), 'MM/dd/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(ad.calculatedPrice || 0)}
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
