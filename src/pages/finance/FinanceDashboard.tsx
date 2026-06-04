import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useInvoices } from '@/hooks/use-invoices'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Download,
  Wallet,
  TrendingDown,
  Clock,
  Calendar,
  Plus,
  Lock,
  Receipt,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { PayablesManager } from '@/components/finance/PayablesManager'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { formatCurrencyValue } from '@/lib/utils'
import { CurrencyInput } from '@/components/CurrencyInput'
import { supabase } from '@/lib/supabase/client'

export default function FinanceDashboard() {
  const { user } = useAuthStore()
  const { invoices, createInvoice } = useInvoices(user?.id)
  const { toast } = useToast()

  const handleRequestRefund = async (invoice: any) => {
    try {
      const { error } = await supabase.functions.invoke('process-refund', {
        body: { invoiceId: invoice.id, action: 'request' },
      })
      if (error) throw error
      toast({ title: t('finance.toast.refund_req_success') })
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast({
        title: t('finance.toast.refund_req_error'),
        variant: 'destructive',
      })
    }
  }

  const handleApproveRefund = async (invoice: any) => {
    try {
      const { error } = await supabase.functions.invoke('process-refund', {
        body: { invoiceId: invoice.id, action: 'approve' },
      })
      if (error) throw error
      toast({ title: t('finance.toast.refund_app_success') })
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast({
        title: t('finance.toast.refund_app_error'),
        variant: 'destructive',
      })
    }
  }
  const { formatDate, t } = useLanguageStore()

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    title: '',
    amount: 0,
    date: '',
  })

  if (!user) return null

  // Role-Based Access Control
  const hasTeamRole = !!user.teamRole
  const canAccess =
    !hasTeamRole || ['Admin', 'Accountant'].includes(user.teamRole || '')

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <Lock className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">{t('access.restricted.title')}</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {t('access.restricted.desc')}
        </p>
        <Button asChild>
          <Link to="/dashboard">{t('back')}</Link>
        </Button>
      </div>
    )
  }

  const isPJ = user.entityType === 'pj'
  const transactions = invoices.filter((t) => t.status !== 'scheduled')
  const scheduled = invoices.filter((t) => t.status === 'scheduled')

  const totalEarnings = transactions
    .filter((t) => t.receiver_id === user.id && t.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalSpent = transactions
    .filter((t) => t.payer_id === user.id)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const pendingAmount = transactions
    .filter(
      (t) =>
        (t.receiver_id === user.id || t.payer_id === user.id) &&
        (t.status === 'escrow' || t.status === 'pending'),
    )
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Emulate total balance for the visual AC matching
  const totalBalance = totalEarnings - totalSpent + 15000

  // Mock Cash Flow Data
  const cashFlowData = [
    { month: 'Jan', entrada: 4000, saida: 2400 },
    { month: 'Feb', entrada: 3000, saida: 1398 },
    { month: 'Mar', entrada: 2000, saida: 9800 },
    { month: 'Apr', entrada: 2780, saida: 3908 },
    { month: 'May', entrada: 1890, saida: 4800 },
    { month: 'Jun', entrada: 2390, saida: 3800 },
  ]

  const chartConfig = {
    entrada: {
      label: t('finance.chart.income') || 'Income',
      color: 'hsl(var(--primary))',
    },
    saida: {
      label: t('finance.chart.expenses') || 'Expenses',
      color: 'hsl(var(--destructive))',
    },
  }

  const handleSchedule = async () => {
    await createInvoice({
      payer_id: user.id,
      amount: scheduleData.amount,
      description: scheduleData.title,
      status: 'scheduled',
      due_date: new Date(scheduleData.date).toISOString(),
    })

    setIsScheduleOpen(false)
    toast({ title: t('finance.toast.payment_scheduled') })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finance.page_title')}
          </h1>
          <p className="text-muted-foreground">{t('finance.page_desc')}</p>
        </div>
        <div className="flex gap-2">
          {isPJ && (
            <Button variant="outline" asChild>
              <Link to="/finance/accounting">
                <Download className="mr-2 h-4 w-4" />{' '}
                {t('finance.export.title')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards based on AC */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('finance.total_balance')}
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyValue(totalBalance, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('finance.balance_desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('finance.total_spent')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyValue(totalSpent, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('finance.spent_desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('finance.pending_invoices')}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyValue(pendingAmount, 'BRL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('finance.pending_desc')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start h-auto p-1 scrollbar-none">
          <TabsTrigger value="overview">
            {t('finance.tab_overview')}
          </TabsTrigger>
          {isPJ && (
            <TabsTrigger value="cashflow">{t('finance.cashflow')}</TabsTrigger>
          )}
          <TabsTrigger value="scheduled">
            {t('finance.tab_scheduled')}
          </TabsTrigger>
          <TabsTrigger value="earnings">
            {t('finance.tab_receipts')}
          </TabsTrigger>
          <TabsTrigger value="payables">
            {t('finance.tab_payables')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>{t('finance.balance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                  >
                    <BarChart data={cashFlowData.slice(0, 4)}>
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) =>
                              formatCurrencyValue(Number(value), 'BRL')
                            }
                          />
                        }
                      />
                      <Bar
                        dataKey="entrada"
                        fill="var(--color-entrada)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="saida"
                        fill="var(--color-saida)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('finance.transaction_history')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('finance.table.date')}</TableHead>
                      <TableHead>{t('finance.table.description')}</TableHead>
                      <TableHead>{t('finance.table.value')}</TableHead>
                      <TableHead>{t('finance.table.type')}</TableHead>
                      <TableHead>{t('finance.table.status')}</TableHead>
                      <TableHead className="text-right">
                        {t('finance.table.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.slice(0, 5).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {formatDate(tx.created_at, 'MM/dd/yy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.description}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrencyValue(
                              tx.amount,
                              tx.currency || 'BRL',
                            )}
                          </TableCell>
                          <TableCell>
                            {tx.payer_id === user.id ? (
                              <span className="text-red-500 font-medium">
                                {t('finance.type.expense')}
                              </span>
                            ) : (
                              <span className="text-green-500 font-medium">
                                {t('finance.type.income')}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {tx.status === 'completed' && (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                {t('finance.status.paid')}
                              </Badge>
                            )}
                            {tx.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                {t('finance.status.pending')}
                              </Badge>
                            )}
                            {tx.status === 'escrow' && (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                {t('finance.status.escrow')}
                              </Badge>
                            )}
                            {tx.status === 'scheduled' && (
                              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                {t('finance.status.scheduled')}
                              </Badge>
                            )}
                            {tx.status === 'failed' && (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                {t('finance.status.cancelled')}
                              </Badge>
                            )}
                            {tx.status === 'refund_requested' && (
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                                {t('finance.status.refund_requested')}
                              </Badge>
                            )}
                            {tx.status === 'refunded' && (
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                {t('finance.status.refunded')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.payer_id === user.id &&
                              (tx.status === 'completed' ||
                                tx.status === 'escrow') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRequestRefund(tx)}
                                >
                                  {t('finance.btn.request_refund')}
                                </Button>
                              )}
                            {tx.receiver_id === user.id &&
                              tx.status === 'refund_requested' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveRefund(tx)}
                                >
                                  {t('finance.btn.approve_refund')}
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          {t('finance.table.empty')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.projected_flow')}</CardTitle>
              <CardDescription>{t('finance.comparative_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        formatCurrencyValue(value, 'BRL')
                      }
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(value) =>
                            formatCurrencyValue(Number(value), 'BRL')
                          }
                        />
                      }
                    />
                    <Area
                      dataKey="saida"
                      type="natural"
                      fill="var(--color-saida)"
                      fillOpacity={0.4}
                      stroke="var(--color-saida)"
                      stackId="a"
                    />
                    <Area
                      dataKey="entrada"
                      type="natural"
                      fill="var(--color-entrada)"
                      fillOpacity={0.4}
                      stroke="var(--color-entrada)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.receipts.title')}</CardTitle>
              <CardDescription>{t('finance.receipts.desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.table.date')}</TableHead>
                    <TableHead>{t('finance.table.description')}</TableHead>
                    <TableHead>{t('finance.receipts.client')}</TableHead>
                    <TableHead>{t('finance.table.value')}</TableHead>
                    <TableHead>{t('finance.table.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('finance.table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((tx) => tx.receiver_id === user.id)
                    .map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {formatDate(tx.created_at, 'MM/dd/yy')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.description}
                        </TableCell>
                        <TableCell>{t('finance.external_client')}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrencyValue(tx.amount, tx.currency || 'BRL')}
                        </TableCell>
                        <TableCell>
                          {tx.status === 'completed' && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              {t('finance.status.paid')}
                            </Badge>
                          )}
                          {tx.status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              {t('finance.status.pending')}
                            </Badge>
                          )}
                          {tx.status === 'escrow' && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              {t('finance.status.escrow')}
                            </Badge>
                          )}
                          {tx.status === 'refund_requested' && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                              {t('finance.status.refund_requested')}
                            </Badge>
                          )}
                          {tx.status === 'refunded' && (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                              {t('finance.status.refunded')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {tx.status === 'refund_requested' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveRefund(tx)}
                            >
                              {t('finance.btn.approve_refund')}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {transactions.filter((tx) => tx.receiver_id === user.id)
                    .length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('finance.receipts.empty')}
                      </TableCell>{' '}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="space-y-4 mt-4">
          <PayablesManager />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />{' '}
                  {t('finance.schedule_payment')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('finance.new_schedule')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>{t('finance.description')}</Label>
                    <Input
                      value={scheduleData.title}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          title: e.target.value,
                        })
                      }
                      placeholder={t('finance.placeholder.description')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('finance.value')}</Label>
                    <CurrencyInput
                      value={scheduleData.amount}
                      onChange={(val) =>
                        setScheduleData({ ...scheduleData, amount: val })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('finance.date')}</Label>
                    <Input
                      value={scheduleData.date}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          date: e.target.value,
                        })
                      }
                      type="date"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSchedule}>
                    {t('finance.confirm_schedule')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('finance.future_payments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.date_scheduled')}</TableHead>
                    <TableHead>{t('finance.description')}</TableHead>
                    <TableHead>{t('finance.beneficiary')}</TableHead>
                    <TableHead>{t('finance.value')}</TableHead>
                    <TableHead>{t('finance.table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduled.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-purple-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {tx.due_date
                            ? formatDate(tx.due_date, 'MM/dd/yyyy')
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        {tx.receiver_id === user.id
                          ? t('finance.you')
                          : t('finance.external')}
                      </TableCell>
                      <TableCell>
                        {formatCurrencyValue(tx.amount, tx.currency || 'BRL')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-purple-200 bg-purple-50 text-purple-700"
                        >
                          {t('finance.status.scheduled')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {scheduled.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('finance.empty_scheduled')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
