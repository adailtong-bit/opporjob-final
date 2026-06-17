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
import { AdActionsMenu } from './components/AdActionsMenu'
import { AdCreateDialog } from './components/AdCreateDialog'
import { PricingMatrixTab } from './components/PricingMatrixTab'
import { AdvertisersTab } from './components/AdvertisersTab'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { supabase } from '@/lib/supabase/client'

export default function ManageAds() {
  const { ads, fetchAds, checkExpirations } = useAdStore()
  const [createOpen, setCreateOpen] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguageStore()

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  useEffect(() => {
    if (ads.length > 0) {
      const expired = checkExpirations()
      if (expired.length > 0) {
        expired.forEach((ad) => {
          toast({
            title: `Ad Expired: ${ad.title}`,
            description: `Ad validity expired. Status updated to expired.`,
            duration: 8000,
          })
        })
      }
    }
  }, [ads.length, checkExpirations, toast])

  const getStatusBadge = (ad: any) => {
    const toggle = async () => {
      const newStatus = ad.status === 'active' ? 'draft' : 'active'
      await supabase
        .from('advertising_campaigns')
        .update({ status: newStatus })
        .eq('id', ad.id)
      fetchAds()
    }
    switch (ad.status) {
      case 'active':
        return (
          <Badge className="bg-green-500 cursor-pointer" onClick={toggle}>
            Active
          </Badge>
        )
      case 'paused':
        return (
          <Badge className="bg-yellow-500 cursor-pointer" onClick={toggle}>
            Paused
          </Badge>
        )
      case 'draft':
        return (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={toggle}
          >
            Draft
          </Badge>
        )
      case 'canceled':
        return (
          <Badge
            variant="destructive"
            className="cursor-pointer"
            onClick={toggle}
          >
            Canceled
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="cursor-pointer" onClick={toggle}>
            Expired
          </Badge>
        )
      default:
        return (
          <Badge className="capitalize cursor-pointer" onClick={toggle}>
            {ad.status}
          </Badge>
        )
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
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
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
                  <TableHead>Campaign</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">
                      {ad.advertiser?.name || 'Unknown'}
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {ad.advertiser?.email && (
                          <div>{ad.advertiser.email}</div>
                        )}
                        {ad.advertiser?.document && (
                          <div>Doc: {ad.advertiser.document}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{ad.title}</span>
                        {ad.target_url && (
                          <a
                            href={ad.target_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate max-w-[200px]"
                          >
                            {ad.target_url}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant="outline">{ad.tier}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {ad.specifications?.region} |{' '}
                          {ad.specifications?.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {ad.start_date && (
                        <div>
                          Start: {format(new Date(ad.start_date), 'MM/dd/yyyy')}
                        </div>
                      )}
                      {ad.end_date && (
                        <div>
                          End: {format(new Date(ad.end_date), 'MM/dd/yyyy')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(ad.price || 0)}
                    </TableCell>
                    <TableCell>{getStatusBadge(ad)}</TableCell>
                    <TableCell className="text-right">
                      <AdActionsMenu ad={ad} />
                    </TableCell>
                  </TableRow>
                ))}
                {ads.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No campaigns found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="advertisers">
          <AdvertisersTab />
        </TabsContent>

        <TabsContent value="matrix">
          <PricingMatrixTab />
        </TabsContent>
      </Tabs>

      <AdCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
