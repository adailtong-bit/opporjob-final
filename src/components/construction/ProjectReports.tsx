import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Download, FileText, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface ProjectReportsProps {
  projectId: string
}

export function ProjectReports({ projectId }: ProjectReportsProps) {
  const { getProject } = useProjectStore()
  const { t, formatCurrency, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  if (!project) return null

  // Process data for charts
  const budgetItems = project.budgetItems || []
  const totalBudget = budgetItems.reduce((acc, item) => acc + item.totalCost, 0)

  // Group by category
  const categoryData = [
    { name: t('proj.budget.material'), value: 0, color: 'hsl(var(--chart-1))' },
    { name: t('proj.budget.labor'), value: 0, color: 'hsl(var(--chart-2))' },
    { name: t('proj.budget.other'), value: 0, color: 'hsl(var(--chart-3))' },
  ]

  budgetItems.forEach((item) => {
    const idx =
      item.category === 'material' ? 0 : item.category === 'labor' ? 1 : 2
    categoryData[idx].value += item.totalCost
  })

  // Progress Data (Mocked actuals vs budget based on stages)
  const progressData = project.stages.map((stage) => ({
    name: stage.name.split('.')[0], // Short name
    budget: stage.budgetMaterial + stage.budgetLabor,
    actual: stage.actualMaterial + stage.actualLabor,
  }))

  const chartConfig = {
    budget: {
      label: t('proj.reports.budgeted'),
      color: 'hsl(var(--chart-1))',
    },
    actual: {
      label: t('proj.reports.actual'),
      color: 'hsl(var(--chart-2))',
    },
  }

  const handleExport = (type: 'pdf' | 'csv') => {
    toast({
      title: t('success'),
      description: t('proj.reports.exported', { type: type.toUpperCase() }),
    })
  }

  // Compliance Expirations logic
  const leadTimeDays = project.alertLeadTimeDays || 30
  const today = new Date()

  const complianceAlerts = (project.complianceDocuments || [])
    .filter((doc) => {
      const exp = new Date(doc.expirationDate)
      const diffDays = Math.ceil(
        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )
      return diffDays <= leadTimeDays
    })
    .sort(
      (a, b) =>
        new Date(a.expirationDate).getTime() -
        new Date(b.expirationDate).getTime(),
    )

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('proj.reports.title')}
          </h2>
          <p className="text-muted-foreground">{t('proj.reports.desc')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" /> {t('proj.reports.export_pdf')}
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" /> {t('proj.reports.export_csv')}
          </Button>
        </div>
      </div>

      {complianceAlerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
              <ShieldAlert className="h-5 w-5" /> Resumo de Compliance (Atenção
              Necessária)
            </CardTitle>
            <CardDescription>
              Existem {complianceAlerts.length} documento(s) vencido(s) ou
              próximos do vencimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3">
              {complianceAlerts.map((doc) => {
                const exp = new Date(doc.expirationDate)
                const isExpired = exp.getTime() < today.getTime()
                return (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center bg-card border p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {isExpired ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.partnerId === 'general'
                            ? 'Projeto (Geral)'
                            : project.partners.find(
                                (p) => p.id === doc.partnerId,
                              )?.companyName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={isExpired ? 'destructive' : 'secondary'}
                        className={
                          !isExpired
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : ''
                        }
                      >
                        {isExpired ? 'Vencido' : 'Vence em Breve'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(doc.expirationDate, 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{t('proj.reports.progress_budget')}</CardTitle>
            <CardDescription>
              {t('proj.reports.chart_progress')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={progressData}>
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
                  <Legend />
                  <Bar
                    dataKey="budget"
                    fill="var(--color-budget)"
                    radius={[4, 4, 0, 0]}
                    name={t('proj.reports.budgeted')}
                  />
                  <Bar
                    dataKey="actual"
                    fill="var(--color-actual)"
                    radius={[4, 4, 0, 0]}
                    name={t('proj.reports.actual')}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{t('proj.reports.category_dist')}</CardTitle>
            <CardDescription>{t('proj.reports.chart_dist')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="text-center mt-4">
              <span className="text-sm text-muted-foreground">
                {t('proj.reports.total')}: {formatCurrency(totalBudget)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
