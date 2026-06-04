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
import { useInvoices } from '@/hooks/use-invoices'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function ProjectInvoices({ projectId }: { projectId: string }) {
  const { invoices, loading } = useInvoices(undefined, projectId)
  const { formatCurrency, formatDate } = useLanguageStore()

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
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider text-[10px] uppercase ml-2">
              DEMO
            </Badge>
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
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {inv.description || 'Invoice'}
                  </TableCell>
                  <TableCell className="capitalize">{inv.type}</TableCell>
                  <TableCell>
                    {inv.due_date
                      ? formatDate(inv.due_date, 'dd/MM/yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`uppercase text-[10px] ${getStatusColor(inv.status)}`}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No invoices recorded for this project.
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
