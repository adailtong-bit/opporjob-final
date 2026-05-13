import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  PieChart,
  WalletCards,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectFinanceCosts } from './ProjectFinanceCosts'
import { ProjectFinanceAccounts } from './ProjectFinanceAccounts'
import { ProjectFinanceLedger } from './ProjectFinanceLedger'
import { ProjectExecution } from './ProjectExecution'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function ProjectFinance({ projectId }: { projectId: string }) {
  const { getProject } = useProjectStore()
  const { formatCurrency, t } = useLanguageStore()
  const project = getProject(projectId)

  if (!project) return null

  const movements = project.financialMovements || []
  const stages = project.stages || []
  const budgetItemsList = project.budgetItems || []
  const ledgerEntries = project.ledgerEntries || []

  // Calculated Budget (Planned)
  const estCapex =
    budgetItemsList
      .filter((i) => i.costClass === 'capex' || !i.costClass)
      .reduce((a, b) => a + b.totalCost, 0) +
    stages.reduce((a, s) => a + s.budgetMaterial + s.budgetLabor, 0)

  const estSoft = budgetItemsList
    .filter((i) => i.costClass === 'soft_cost')
    .reduce((a, b) => a + b.totalCost, 0)

  const estLedger = ledgerEntries.reduce((a, b) => a + b.estimatedCost, 0)

  const calculatedTotalBudget = estCapex + estSoft + estLedger

  // Calculated Actual (Realized)
  const actCapex =
    (project.allocatedCosts || [])
      .filter((c) => c.costClass === 'capex' || !c.costClass)
      .reduce((a, b) => a + b.amount, 0) +
    stages.reduce((a, s) => a + s.actualMaterial + s.actualLabor, 0) +
    (project.laborAdjustments?.reduce((a, adj) => a + adj.amount, 0) || 0)

  const actSoft = (project.allocatedCosts || [])
    .filter((c) => c.costClass === 'soft_cost')
    .reduce((a, b) => a + b.amount, 0)

  const actLedger = ledgerEntries.reduce((a, b) => a + b.finalCost, 0)

  const totalRealizedCosts = actCapex + actSoft + actLedger

  // Financial Variance
  const financialVariance = calculatedTotalBudget - totalRealizedCosts
  const isOverBudget = financialVariance < 0

  // Outflows for reference
  const totalOutflows = movements
    .filter((m) => m.type === 'out')
    .reduce((acc, m) => acc + m.amount, 0)

  // Chart Data
  const chartData = [
    { name: 'CAPEX (Obra)', planned: estCapex, realized: actCapex },
    { name: 'Soft Costs', planned: estSoft, realized: actSoft },
    { name: 'Ledger', planned: estLedger, realized: actLedger },
  ]

  const chartConfig = {
    planned: {
      label: 'Previsto',
      color: 'hsl(var(--chart-1))',
    },
    realized: {
      label: 'Realizado',
      color: 'hsl(var(--chart-2))',
    },
  }

  // Alerts
  let delayedCount = 0
  stages.forEach((s) => {
    if (s.status === 'delayed') delayedCount++
    s.subStages.forEach((sub) => {
      if (sub.status === 'delayed') delayedCount++
    })
  })
  const estimatedDelayImpactPerTask = 500
  const totalDelayImpact = delayedCount * estimatedDelayImpactPerTask

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const complianceAlerts = (project.complianceDocuments || []).filter((doc) => {
    const exp = new Date(doc.expirationDate)
    exp.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )
    return diffDays <= (project.alertLeadTimeDays || 30)
  })
  const expiredCount = complianceAlerts.filter(
    (d) => new Date(d.expirationDate) < new Date(),
  ).length

  return (
    <Card className="flex flex-col w-full min-w-0 border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="shrink-0 pb-4">
        <CardTitle>
          {t('finance.integrated_dashboard', undefined) ||
            'Integrated Financial Dashboard'}
        </CardTitle>
        <CardDescription>
          {t('finance.integrated_dashboard_desc', undefined) ||
            'Centralized tracking: Budget vs. Current Account Expenses and Ledger.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col min-h-0">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6 shrink-0">
          <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {t('finance.budget_planned', undefined) || 'Budget (Planned)'}
              </p>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                <span className="text-xl font-bold text-foreground truncate">
                  {formatCurrency(calculatedTotalBudget)}
                </span>
              </div>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {t('finance.realized_cost', undefined) || 'Realized Cost'}
              </p>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <span className="text-xl font-bold text-foreground truncate">
                  {formatCurrency(totalRealizedCosts)}
                </span>
              </div>
            </div>

            <div className="bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {t('finance.account_outflows', undefined) ||
                  'Current Account Outflows'}
              </p>
              <div className="flex items-center gap-2">
                <WalletCards className="h-5 w-5 text-orange-500" />
                <span className="text-xl font-bold text-foreground truncate">
                  {formatCurrency(totalOutflows)}
                </span>
              </div>
            </div>

            <div
              className={cn(
                'p-4 rounded-xl border',
                isOverBudget
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                  : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50',
              )}
            >
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {t('finance.overall_variance', undefined) || 'Overall Variance'}
              </p>
              <div className="flex items-center gap-2">
                {isOverBudget ? (
                  <TrendingDown className="h-5 w-5 text-red-600 shrink-0" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-green-600 shrink-0" />
                )}
                <span
                  className={cn(
                    'text-xl font-bold truncate',
                    isOverBudget
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400',
                  )}
                >
                  {isOverBudget ? '' : '+'}
                  {formatCurrency(financialVariance)}
                </span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-card border rounded-xl p-4 shadow-sm h-full min-h-[300px] flex flex-col">
            <h3 className="text-sm font-semibold mb-2 shrink-0">
              {t('finance.planned_vs_realized', undefined) ||
                'Planned vs. Realized'}
            </h3>
            <div className="flex-1 min-h-0">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
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
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="planned"
                    fill="var(--color-planned)"
                    radius={[4, 4, 0, 0]}
                    name="Previsto"
                  />
                  <Bar
                    dataKey="realized"
                    fill="var(--color-realized)"
                    radius={[4, 4, 0, 0]}
                    name="Realizado"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {complianceAlerts.length > 0 && (
          <Alert
            variant="destructive"
            className="mb-4 bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {t('alert.compliance_title', undefined) || 'Compliance Alert'}
            </AlertTitle>
            <AlertDescription>
              {t('alert.compliance_desc_1', undefined) || 'There are'}{' '}
              <strong>{complianceAlerts.length}</strong>{' '}
              {t('alert.compliance_desc_2', undefined) ||
                'document(s) with issues (Expired:'}{' '}
              {expiredCount}).{' '}
              {t('alert.compliance_desc_3', undefined) ||
                'Vendors with expired critical documentation are'}{' '}
              <strong>
                {t('alert.compliance_desc_4', undefined) ||
                  'blocked for payment'}
              </strong>{' '}
              {t('alert.compliance_desc_5', undefined) || 'in the Ledger.'}
            </AlertDescription>
          </Alert>
        )}

        {delayedCount > 0 && (
          <Alert
            variant="destructive"
            className="mb-6 bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {t('alert.delay_impact_title', undefined) ||
                'Cost Impact Alert (Delays)'}
            </AlertTitle>
            <AlertDescription>
              {t('alert.delay_impact_desc_1', undefined) || 'The schedule has'}{' '}
              <strong>{delayedCount}</strong>{' '}
              {t('alert.delay_impact_desc_2', undefined) ||
                'delayed milestones/tasks. The estimated impact on indirect costs (Soft Costs) is'}{' '}
              <strong>{formatCurrency(totalDelayImpact)}</strong>,{' '}
              {t('alert.delay_impact_desc_3', undefined) ||
                'increasing budget consumption.'}
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="ledger"
          className="w-full flex flex-col mt-4 min-w-0"
        >
          <div className="w-full overflow-x-auto pb-2 mb-4 -mx-2 px-2 shrink-0 scrollbar-hide">
            <TabsList className="flex w-max min-w-full h-auto p-1 justify-start">
              <TabsTrigger
                value="ledger"
                className="py-2 px-4 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 shrink-0" />{' '}
                {t('finance.tab_ledger', undefined) || 'Ledger'}
              </TabsTrigger>
              <TabsTrigger
                value="execucao"
                className="py-2 px-4 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4 shrink-0" />{' '}
                {t('finance.tab_execution', undefined) || 'Physical-Financial'}
              </TabsTrigger>
              <TabsTrigger
                value="visao_geral"
                className="py-2 px-4 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap"
              >
                <PieChart className="w-4 h-4 shrink-0" />{' '}
                {t('finance.tab_allocated', undefined) || 'Allocated Costs'}
              </TabsTrigger>
              <TabsTrigger
                value="conta_corrente"
                className="py-2 px-4 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap"
              >
                <WalletCards className="w-4 h-4 shrink-0" />{' '}
                {t('finance.tab_account', undefined) || 'Current Account'}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ledger" className="w-full m-0">
            <ProjectFinanceLedger projectId={projectId} />
          </TabsContent>

          <TabsContent value="execucao" className="w-full m-0">
            <ProjectExecution projectId={projectId} />
          </TabsContent>

          <TabsContent value="visao_geral" className="w-full m-0">
            <ProjectFinanceCosts projectId={projectId} />
          </TabsContent>

          <TabsContent value="conta_corrente" className="w-full m-0">
            <ProjectFinanceAccounts projectId={projectId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
