import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProjectStore } from '@/stores/useProjectStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Check,
  Clock,
  Upload,
  Receipt,
  DollarSign,
  Lock,
  Activity,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

export function PayablesManager() {
  const { user } = useAuthStore()
  const { formatCurrency, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const { updateStageActuals, projects, updateAllocatedCost } =
    useProjectStore()

  const [payables, setPayables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  const [status, setStatus] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')

  const fetchPayables = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        vendor:vendors(*)
      `,
      )
      .eq('payer_id', user?.id)
      .not('vendor_id', 'is', null) // Only show invoices linked to vendors (Payables)
      .order('due_date', { ascending: true })

    if (data) {
      setPayables(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchPayables()
    }
  }, [user])

  const handleEdit = async (inv: any) => {
    setEditingInvoice(inv)
    setStatus(inv.status || 'pending')
    setPaymentDate(
      inv.payment_date
        ? new Date(inv.payment_date).toISOString().split('T')[0]
        : '',
    )
    setReceiptUrl(inv.receipt_url || '')

    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*, profiles!user_id(name, email)')
      .eq('entity_type', 'invoices')
      .eq('entity_id', inv.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setAuditLogs(logs || [])
  }

  const handleSave = async () => {
    if (!editingInvoice) return

    const isNowPaid = status === 'paid' && editingInvoice.status !== 'paid'

    const { error } = await supabase
      .from('invoices')
      .update({
        status,
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : null,
        receipt_url: receiptUrl,
      })
      .eq('id', editingInvoice.id)

    if (!error) {
      toast({ title: 'Fatura atualizada com sucesso!' })

      if (isNowPaid && editingInvoice.project_id) {
        if (editingInvoice.task_id) {
          updateStageActuals(
            editingInvoice.project_id,
            editingInvoice.task_id,
            'material',
            editingInvoice.amount,
          )
        }
        // Convert estimated cost to actual
        const proj = projects.find((p) => p.id === editingInvoice.project_id)
        const cost = proj?.allocatedCosts?.find(
          (c) =>
            c.amount === editingInvoice.amount &&
            c.type === 'estimated' &&
            (c.description.includes(editingInvoice.vendor?.name) ||
              c.description.includes('Pedido')),
        )
        if (cost) {
          updateAllocatedCost(editingInvoice.project_id, cost.id, {
            type: 'actual',
          })
        }
      }

      fetchPayables()
      setEditingInvoice(null)
    } else {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'paid':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
            Pago
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            Em Processamento
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            Pendente
          </Badge>
        )
      case 'awaiting_confirmation':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
            Aguardando Confirmação
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {s}
          </Badge>
        )
    }
  }

  const totalPending = payables
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalPaid = payables
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Gestão de Contas a
            Pagar
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe as faturas geradas nas compras, atualize status de
            pagamento e anexe comprovantes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Pendente a Pagar
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {formatCurrency(totalPending)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Pago
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {formatCurrency(totalPaid)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição / Fornecedor</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confirmação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  Carregando contas a pagar...
                </TableCell>
              </TableRow>
            ) : payables.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Receipt className="w-10 h-10 mx-auto opacity-30 mb-3" />
                  <p>Nenhuma conta a pagar encontrada.</p>
                  <p className="text-xs mt-1">
                    As faturas vinculadas aos seus fornecedores aparecerão aqui.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              payables.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium whitespace-nowrap">
                    {inv.due_date
                      ? formatDate(inv.due_date, 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {inv.description || 'Fatura de Compra'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      {inv.vendor?.name || 'Fornecedor Avulso'}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-base whitespace-nowrap">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {inv.payment_date ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="h-4 w-4" /> Pago em{' '}
                        {formatDate(inv.payment_date, 'dd/MM')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Aguardando
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(inv)}
                      className="shadow-sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" /> Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingInvoice}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Gerenciar Pagamento
              {editingInvoice?.status === 'paid' && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-emerald-50 text-emerald-600 border-emerald-200"
                >
                  <Lock className="w-3 h-3 mr-1" /> Fatura Fechada
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Atualize o status desta fatura e anexe comprovantes.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/30 p-3 rounded-lg border text-sm mb-2 mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Fornecedor:</span>
              <span className="font-semibold">
                {editingInvoice?.vendor?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-bold text-primary">
                {editingInvoice ? formatCurrency(editingInvoice.amount) : ''}
              </span>
            </div>
          </div>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Status do Pagamento</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={editingInvoice?.status === 'paid'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente (No Prazo)</SelectItem>
                  <SelectItem value="processing">
                    Em Processamento Bancário
                  </SelectItem>
                  <SelectItem value="awaiting_confirmation">
                    Aguardando Confirmação do Fornecedor
                  </SelectItem>
                  <SelectItem value="paid">Pago / Liquidado</SelectItem>
                </SelectContent>
              </Select>
              {editingInvoice?.status === 'paid' && (
                <p className="text-[10px] text-emerald-600 font-medium">
                  Esta fatura já foi liquidada e o status não pode ser alterado.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Data de Pagamento Efetivado</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={editingInvoice?.status === 'paid'}
              />
              <p className="text-[10px] text-muted-foreground">
                Preencha apenas se o pagamento já foi realizado.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Comprovante (URL ou Referência)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Link do comprovante, ID da transação..."
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                />
                <Button variant="secondary" size="icon" title="Fazer Upload">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {auditLogs.length > 0 && (
              <div className="space-y-2 border-t pt-4 mt-2">
                <Label className="flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Histórico de Auditoria
                </Label>
                <div className="space-y-2 mt-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="text-xs border p-2 rounded bg-muted/20"
                    >
                      <div className="flex justify-between font-medium mb-1">
                        <span>{log.action}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Por:{' '}
                        {log.profiles?.name || log.profiles?.email || 'Sistema'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4 border-t pt-4">
            <Button variant="ghost" onClick={() => setEditingInvoice(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
