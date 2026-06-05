import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  Search,
  Users,
  Activity,
  ExternalLink,
  History,
  RefreshCcw,
  Mail,
} from 'lucide-react'
import { FinancialInvoiceDialog } from './components/FinancialInvoiceDialog'
import { useToast } from '@/hooks/use-toast'
import { formatCurrencyValue } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export default function FinancialControl() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('subscription')
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    // Fetch Invoices
    const { data: invData, error: invError } = await supabase
      .from('invoices')
      .select(
        `
        *,
        payer:profiles!invoices_payer_id_fkey(name, email, entity_type, role),
        vendor:vendors(*)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(500)

    if (!invError && invData) {
      setInvoices(invData)
    }

    // Fetch Subscribers (Profiles with active plans)
    const { data: subData, error: subError } = await supabase
      .from('profiles')
      .select(
        `
        id, name, email, entity_type, role, status, subscription_status, subscription_end_date,
        plan:construction_plans(name, price)
      `,
      )
      .not('plan_id', 'is', null)

    if (!subError && subData) {
      setSubscribers(subData)
    }

    setLoading(false)
  }

  // Derived Stats
  const subscriptionInvoices = invoices.filter((i) => i.type === 'subscription')
  const totalSubscribers = subscribers.filter(
    (s) => s.subscription_status === 'active' || s.status === 'active',
  ).length
  const mrr = subscribers
    .filter((s) => s.subscription_status === 'active' || s.status === 'active')
    .reduce((acc, curr) => acc + (Number(curr.plan?.price) || 0), 0)

  const adsRevenue = invoices
    .filter((i) => i.type === 'advertising' && i.status === 'paid')
    .reduce((a, b) => a + Number(b.amount), 0)

  const earningsByCategory = [
    {
      name: 'Prestador (PF)',
      total: invoices
        .filter(
          (i) =>
            i.type === 'subscription' &&
            i.status === 'paid' &&
            i.payer?.role === 'provider' &&
            i.payer?.entity_type === 'pf',
        )
        .reduce((a, b) => a + Number(b.amount), 0),
    },
    {
      name: 'Prestador (PJ)',
      total: invoices
        .filter(
          (i) =>
            i.type === 'subscription' &&
            i.status === 'paid' &&
            i.payer?.role === 'provider' &&
            i.payer?.entity_type === 'pj',
        )
        .reduce((a, b) => a + Number(b.amount), 0),
    },
    {
      name: 'Anunciante (PF)',
      total: invoices
        .filter(
          (i) =>
            i.type === 'subscription' &&
            i.status === 'paid' &&
            i.payer?.role === 'advertiser' &&
            i.payer?.entity_type === 'pf',
        )
        .reduce((a, b) => a + Number(b.amount), 0),
    },
    {
      name: 'Anunciante (PJ)',
      total: invoices
        .filter(
          (i) =>
            i.type === 'subscription' &&
            i.status === 'paid' &&
            i.payer?.role === 'advertiser' &&
            i.payer?.entity_type === 'pj',
        )
        .reduce((a, b) => a + Number(b.amount), 0),
    },
  ]

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.payer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.payer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const matchesType = typeFilter === 'all' || inv.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Dashboard Financeiro e Assinaturas
        </h1>
        <p className="text-muted-foreground">
          Monitore o MRR, assinantes e histórico de pagamentos da plataforma.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
          <TabsTrigger value="invoices">Histórico de Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  MRR (Receita Recorrente Mensal)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrencyValue(mrr, 'USD')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado nos planos ativos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Assinantes Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubscribers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Total (Assinaturas)
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrencyValue(
                    subscriptionInvoices
                      .filter((i) => i.status === 'paid')
                      .reduce((a, b) => a + Number(b.amount), 0),
                    'USD',
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita de Anúncios
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrencyValue(adsRevenue, 'USD')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Campanhas finalizadas e pagas
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ganhos por Categoria</CardTitle>
              <CardDescription>
                Receita de assinaturas agrupada por tipo de usuário e perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <RechartsTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="total"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Assinantes</CardTitle>
              <CardDescription>
                Lista de todos os usuários com assinaturas (ativas ou passadas).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Renovação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : subscribers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-10 text-muted-foreground"
                        >
                          Nenhum assinante encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscribers.map((sub) => {
                        const isActive =
                          sub.subscription_status === 'active' ||
                          sub.status === 'active'
                        const isExpired = sub.subscription_status === 'expired'

                        return (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <div className="font-medium">
                                {sub.name || 'Desconhecido'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {sub.email}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {sub.plan?.name || 'Plano Desconhecido'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-col items-start">
                                <Badge
                                  variant="outline"
                                  className="uppercase text-[10px]"
                                >
                                  {sub.entity_type || 'PF'}
                                </Badge>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {sub.role || 'Prestador'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isActive
                                    ? 'default'
                                    : isExpired
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className={
                                  isActive
                                    ? 'bg-green-600'
                                    : isExpired
                                      ? ''
                                      : 'bg-yellow-500'
                                }
                              >
                                {isActive
                                  ? 'Ativo'
                                  : isExpired
                                    ? 'Expirado'
                                    : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {sub.subscription_end_date
                                ? new Date(
                                    sub.subscription_end_date,
                                  ).toLocaleDateString()
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    supabase
                                      .from('profiles')
                                      .update({
                                        subscription_status: isActive
                                          ? 'expired'
                                          : 'active',
                                      })
                                      .eq('id', sub.id)
                                      .then(() => fetchData())
                                  }}
                                >
                                  <RefreshCcw className="h-4 w-4 mr-2" />
                                  {isActive ? 'Revogar' : 'Ativar'}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    supabase
                                      .from('invoices')
                                      .insert({
                                        payer_id: sub.id,
                                        amount: sub.plan?.price || 0,
                                        status: 'pending',
                                        type: 'subscription',
                                        description:
                                          'Manual Invoice - ' +
                                          (sub.plan?.name || 'Plan'),
                                      })
                                      .then(() => fetchData())
                                  }}
                                >
                                  Faturar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    window.location.href = `/admin/users?search=${encodeURIComponent(sub.email)}`
                                  }}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                Lista de todas as faturas geradas na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou descrição..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="subscription">Assinatura</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="paid">Pagos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="review">A Revisar</SelectItem>
                      <SelectItem value="overdue">Atrasados</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pagador</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Recibo / Data
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-10 text-muted-foreground"
                        >
                          Nenhuma fatura encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div className="font-medium">
                              {invoice.payer?.name || 'Usuário Desconhecido'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {invoice.payer?.email || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">
                              {invoice.description}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {invoice.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrencyValue(
                              invoice.amount,
                              invoice.currency || 'USD',
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === 'paid'
                                  ? 'default'
                                  : invoice.status === 'pending'
                                    ? 'outline'
                                    : invoice.status === 'review'
                                      ? 'secondary'
                                      : 'destructive'
                              }
                              className={
                                invoice.status === 'paid'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : invoice.status === 'review'
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : ''
                              }
                            >
                              {invoice.status === 'paid'
                                ? 'Pago'
                                : invoice.status === 'pending'
                                  ? 'Pendente'
                                  : invoice.status === 'review'
                                    ? 'A Revisar'
                                    : invoice.status === 'overdue'
                                      ? 'Atrasado'
                                      : 'Cancelado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-muted-foreground text-xs">
                                {new Date(
                                  invoice.created_at,
                                ).toLocaleDateString()}
                              </span>
                              {invoice.status === 'review' &&
                              invoice.type === 'advertising' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => setSelectedInvoice(invoice)}
                                >
                                  <Mail className="h-3 w-3 mr-1" /> Aprovar &
                                  Enviar
                                </Button>
                              ) : invoice.receipt_url ? (
                                <a
                                  href={invoice.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 text-xs"
                                >
                                  Ver Recibo{' '}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {selectedInvoice && (
        <FinancialInvoiceDialog
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
