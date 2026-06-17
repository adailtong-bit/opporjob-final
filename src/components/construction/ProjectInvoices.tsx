import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Receipt } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { supabase } from '@/lib/supabase/client'
import { formatCurrencyValue } from '@/lib/utils'

export function ProjectInvoices({ projectId }: { projectId: string }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { formatDate } = useLanguageStore()

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('invoices')
        .select('*, vendors(name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (data) setInvoices(data)
      setLoading(false)
    }
    fetchInvoices()
  }, [projectId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500 hover:bg-green-600'
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      case 'overdue':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Financial Records
          </CardTitle>
          <CardDescription>
            Invoices, receipts and payments strictly related to this project.
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" /> Create Invoice
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto w-full block">
          <Table className="min-w-[700px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Retained</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0
                ? invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        {inv.description || 'Invoice'}
                        {inv.is_retention_release && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] border-orange-200 text-orange-700 bg-orange-50"
                          >
                            Liberação de Retenção
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{inv.type}</TableCell>
                      <TableCell>
                        {inv.due_date
                          ? formatDate(inv.due_date, 'dd/MM/yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrencyValue(inv.amount, inv.currency || 'USD')}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        {inv.retention_amount > 0
                          ? formatCurrencyValue(
                              inv.retention_amount,
                              inv.currency || 'USD',
                            )
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`uppercase text-[10px] ${getStatusColor(inv.status)}`}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                : !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="h-8 w-8 text-muted-foreground/50 mb-2" />
                          <p>No invoices recorded for this project.</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Create Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
