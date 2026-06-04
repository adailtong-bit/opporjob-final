import { useState, useEffect } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { supabase } from '@/lib/supabase/client'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  HardHat,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  PieChart,
} from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PremiumConstructionModal } from '@/components/PremiumConstructionModal'

export default function ConstructionDashboard() {
  const { projects } = useProjectStore()
  const { user } = useAuthStore()
  const { t, formatCurrency, formatDate, currentLanguage } = useLanguageStore()
  const navigate = useNavigate()

  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [dbProjects, setDbProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchDbProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('is_demo', true)
      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          totalBudget: p.total_budget || 0,
          totalSpent: 0,
          progress: p.progress || 0,
          is_demo: p.is_demo,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          location: 'Virtual Site',
          stages: [],
        }))
        setDbProjects(mapped)
      }
    }
    fetchDbProjects()
  }, [])

  const allProjects = [
    ...projects,
    ...dbProjects.filter((dp) => !projects.some((p) => p.id === dp.id)),
  ]
  const activeProjects = allProjects.filter((p) => p.status === 'in_progress')
  const completedProjects = allProjects.filter((p) => p.status === 'completed')

  const totalBudget = allProjects.reduce((acc, p) => acc + p.totalBudget, 0)
  const totalSpent = allProjects.reduce((acc, p) => acc + p.totalSpent, 0)

  // Subscription Check
  const isAdmin = user?.role === 'admin' || user?.isPremium
  const isSubscribed = isAdmin || user?.constructionSubscription?.active

  const handleProtectedAction = (callback: () => void) => {
    if (!isSubscribed) {
      setShowPremiumModal(true)
    } else {
      callback()
    }
  }

  const finishedProjectStats = completedProjects.map((p) => {
    const plannedDays = differenceInDays(p.endDate, p.startDate)
    const actualEnd = p.stages[p.stages.length - 1]?.actualEndDate || p.endDate
    const actualDays = differenceInDays(actualEnd, p.startDate)

    const plannedMat = p.stages.reduce((acc, s) => acc + s.budgetMaterial, 0)
    const actualMat = p.stages.reduce((acc, s) => acc + s.actualMaterial, 0)

    return {
      name: p.name,
      plannedDays,
      actualDays,
      timeVariance: actualDays - plannedDays,
      plannedMat,
      actualMat,
      matVariance: actualMat - plannedMat,
    }
  })

  const analyticsData =
    finishedProjectStats.length > 0
      ? finishedProjectStats
      : [
          {
            name: 'Beta Residential (Mock)',
            plannedDays: 120,
            actualDays: 135,
            timeVariance: 15,
            plannedMat: 50000,
            actualMat: 55000,
            matVariance: 5000,
          },
        ]

  return (
    <div className="space-y-8">
      <PremiumConstructionModal
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('construction.dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('construction.dashboard.desc')}
          </p>
        </div>
        <Button
          onClick={() =>
            handleProtectedAction(() => navigate('/construction/projects/new'))
          }
        >
          <Plus className="mr-2 h-4 w-4" /> {t('construction.new_project')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('construction.active_projects')}
            </CardTitle>
            <HardHat className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('construction.total_projects', { count: projects.length })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('construction.global_budget')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
            <div className="text-xs text-muted-foreground flex justify-between mt-1">
              <span>
                {t('construction.executed')}: {formatCurrency(totalSpent)}
              </span>
              <span>
                {totalBudget > 0
                  ? ((totalSpent / totalBudget) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('construction.alerts')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {t('construction.alert_example')}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    {t('view')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('construction.alert.details')}</DialogTitle>
                    <DialogDescription>
                      {t('construction.alert_example')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-muted p-4 rounded-md text-sm">
                    <p>
                      <strong>{t('construction.alert.impact')}</strong> +5{' '}
                      {t('construction.days')}
                    </p>
                    <p>
                      <strong>{t('construction.alert.responsible')}</strong>{' '}
                      Eng. Carlos
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">
                      {t('construction.alert.notify')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.constructionSubscription?.active && !isAdmin && (
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-800">
              {t('construction.sub.summary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">
                {t('construction.sub.base')}
              </span>
              <span className="font-semibold">
                {formatCurrency(user.constructionSubscription.basePrice)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t('construction.sub.franchise')}
              </span>
              <span className="font-semibold">
                {formatCurrency(user.constructionSubscription.franchiseeMarkup)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t('construction.sub.total')}
              </span>
              <span className="font-bold text-blue-700">
                {formatCurrency(
                  user.constructionSubscription.basePrice +
                    user.constructionSubscription.franchiseeMarkup,
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">
                {t('construction.sub.usage')}
              </span>
              <span className="font-semibold">
                {activeProjects.length} /{' '}
                {user.constructionSubscription.projectLimit} {t('nav.projects')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-800">
              {t('construction.admin_access')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-emerald-700">
            {t('construction.admin_access_desc')}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />{' '}
            {t('construction.analysis')}
          </CardTitle>
          <CardDescription>{t('construction.analysis_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('construction.table.project')}</TableHead>
                <TableHead>{t('construction.table.planned_time')}</TableHead>
                <TableHead>{t('construction.table.actual_time')}</TableHead>
                <TableHead>{t('construction.table.variance_days')}</TableHead>
                <TableHead>
                  {t('construction.table.planned_material')}
                </TableHead>
                <TableHead>{t('construction.table.actual_material')}</TableHead>
                <TableHead>{t('construction.table.variance_cost')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    {d.plannedDays} {t('construction.days')}
                  </TableCell>
                  <TableCell>
                    {d.actualDays} {t('construction.days')}
                  </TableCell>
                  <TableCell
                    className={
                      d.timeVariance > 0
                        ? 'text-red-500 font-bold'
                        : 'text-green-600'
                    }
                  >
                    {d.timeVariance > 0 ? `+${d.timeVariance}` : d.timeVariance}
                  </TableCell>
                  <TableCell>{formatCurrency(d.plannedMat)}</TableCell>
                  <TableCell>{formatCurrency(d.actualMat)}</TableCell>
                  <TableCell
                    className={
                      d.matVariance > 0
                        ? 'text-red-500 font-bold'
                        : 'text-green-600'
                    }
                  >
                    {d.matVariance > 0
                      ? `+${formatCurrency(d.matVariance)}`
                      : d.matVariance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">
          {t('construction.my_projects')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project) => (
            <Card
              key={project.id}
              className="flex flex-col hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                    {project.name}
                    {(project as any).is_demo && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider text-[10px] uppercase">
                        {t('demo.badge') || 'DEMO'}
                      </Badge>
                    )}
                  </CardTitle>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      project.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : project.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {t(`status.${project.status}`)}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('construction.financial_progress')}
                    </span>
                    <span className="font-medium">
                      {project.totalBudget > 0
                        ? (
                            (project.totalSpent / project.totalBudget) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      project.totalBudget > 0
                        ? (project.totalSpent / project.totalBudget) * 100
                        : 0
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">
                      {t('construction.start')}
                    </span>
                    <span className="font-medium">
                      {formatDate(
                        project.startDate,
                        currentLanguage === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy',
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">
                      {t('construction.local')}
                    </span>
                    <span className="font-medium truncate block">
                      {project.location}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    handleProtectedAction(() =>
                      navigate(`/construction/projects/${project.id}`),
                    )
                  }
                >
                  {t('construction.manage')}{' '}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
