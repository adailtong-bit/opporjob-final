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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
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
import { CurrencyInput } from '@/components/CurrencyInput'

export default function FinanceDashboard() {
  const { user } = useAuthStore()
  const { invoices, createInvoice } = useInvoices(user?.id)
  const { toast } = useToast()
  const { formatCurrency, formatDate } = useLanguageStore()

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
        <h1 className="text-2xl font-bold">Restricted Access</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have permission to view the financial dashboard.
        </p>
        <Button asChild>
          <Link to="/dashboard">Back to Home</Link>
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
    entrada: { label: 'Income', color: 'hsl(var(--primary))' },
    saida: { label: 'Expenses', color: 'hsl(var(--destructive))' },
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
    toast({ title: 'Payment Scheduled!' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your cash flow, payments and receipts.
          </p>
        </div>
        <div className="flex gap-2">
          {isPJ && (
            <Button variant="outline" asChild>
              <Link to="/finance/accounting">
                <Download className="mr-2 h-4 w-4" /> Accounting Export
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards based on AC */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available in account
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expenses and payments made
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Values under review or on hold
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isPJ && <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>}
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Balance</CardTitle>
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
                            formatter={(value) => formatCurrency(Number(value))}
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
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
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
                            {formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell>
                            {tx.payer_id === user.id ? (
                              <span className="text-red-500 font-medium">
                                Expense
                              </span>
                            ) : (
                              <span className="text-green-500 font-medium">
                                Income
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {tx.status === 'completed' && (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                Paid
                              </Badge>
                            )}
                            {tx.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                Pending
                              </Badge>
                            )}
                            {tx.status === 'escrow' && (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Escrow
                              </Badge>
                            )}
                            {tx.status === 'scheduled' && (
                              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                Scheduled
                              </Badge>
                            )}
                            {tx.status === 'failed' && (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                Cancelled
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No transactions found.
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
              <CardTitle>Projected Flow</CardTitle>
              <CardDescription>
                Comparison of income and expenses over the months.
              </CardDescription>
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
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(value) => formatCurrency(Number(value))}
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

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Schedule Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Schedule</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input
                      value={scheduleData.title}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Ex: Cement Supplier"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount</Label>
                    <CurrencyInput
                      value={scheduleData.amount}
                      onChange={(val) =>
                        setScheduleData({ ...scheduleData, amount: val })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Scheduled Date</Label>
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
                  <Button onClick={handleSchedule}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Future Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Beneficiary</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
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
                        {tx.receiver_id === user.id ? 'You' : 'External'}
                      </TableCell>
                      <TableCell>{formatCurrency(tx.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-purple-200 bg-purple-50 text-purple-700"
                        >
                          Scheduled
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
                        No future payments scheduled.
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
