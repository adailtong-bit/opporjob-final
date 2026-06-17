import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Download } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { formatCurrencyValue } from '@/lib/utils'

export default function Earnings() {
  const { user } = useAuth()
  const { t, formatDate } = useLanguageStore()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchEarnings = async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .or(`receiver_id.eq.${user.id},vendor_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (data) setInvoices(data)
      setLoading(false)
    }
    fetchEarnings()
  }, [user])

  const totalEarned = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'paid')
        .reduce((acc, curr) => acc + Number(curr.amount), 0),
    [invoices],
  )
  const pendingPayouts = useMemo(
    () =>
      invoices
        .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((acc, curr) => acc + Number(curr.amount), 0),
    [invoices],
  )

  const downloadCSV = () => {
    if (invoices.length === 0) return
    const headers = [
      t('earnings.invoice_date'),
      t('earnings.description'),
      t('earnings.amount'),
      t('earnings.status'),
      'Type',
    ]
    const rows = invoices.map((inv) => [
      formatDate(inv.created_at, 'P'),
      `"${(inv.description || '').replace(/"/g, '""')}"`,
      `"${formatCurrencyValue(Number(inv.amount), inv.currency || 'USD')}"`,
      t(`status.${inv.status}`) || inv.status,
      inv.type || 'service',
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `earnings_export_${formatDate(new Date(), 'yyyyMMdd')}.csv`
    link.click()
  }

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('loading')}
      </div>
    )

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('earnings.page_title')}
        </h1>
        <Button onClick={downloadCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> {t('earnings.download_csv')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              {t('earnings.total_revenue')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {formatCurrencyValue(totalEarned, 'USD')}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              {t('earnings.pending_payouts')}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {formatCurrencyValue(pendingPayouts, 'USD')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('earnings.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              {t('earnings.empty')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('earnings.invoice_date')}</TableHead>
                    <TableHead>{t('earnings.description')}</TableHead>
                    <TableHead>{t('earnings.amount')}</TableHead>
                    <TableHead>{t('earnings.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(inv.created_at, 'P')}
                      </TableCell>
                      <TableCell>{inv.description || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrencyValue(
                          Number(inv.amount),
                          inv.currency || 'USD',
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === 'paid' ? 'default' : 'secondary'
                          }
                          className={
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                              : ''
                          }
                        >
                          {t(`status.${inv.status}`) || inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
