import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useConstructionDocumentStore } from '@/stores/useConstructionDocumentStore'
import { useMessageStore } from '@/stores/useMessageStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Star,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Zap,
  Users,
  Briefcase,
  HardHat,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { AINotifications } from '@/components/AINotifications'
import { AdSection } from '@/components/AdSection'
import { useVendorStore } from '@/stores/useVendorStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { differenceInDays } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()
  const { projects } = useProjectStore()
  const { documents } = useConstructionDocumentStore()
  const { interests, acceptInterest, declineInterest, sendInterest } =
    useMessageStore()
  const { vendors, favorites, fetchVendors, fetchFavorites, toggleFavorite } =
    useVendorStore()
  const { t, formatDate, formatCurrency } = useLanguageStore()
  const formatUSD = (amount: number) => formatCurrency(amount, 'USD')
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    fetchVendors()
    if (user) fetchFavorites()
  }, [user])

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const displayedVendors = showOnlyFavorites
    ? vendors.filter((v) => favorites.includes(v.id))
    : vendors

  const handleTabChange = (val: string) => {
    setSearchParams(
      (prev) => {
        prev.set('tab', val)
        return prev
      },
      { replace: true },
    )
  }

  const isAdmin = user?.role === 'admin'
  const isContractor = user?.role === 'contractor'

  const myPendingInterests = interests.filter(
    (i) => i.targetId === user?.id && i.status === 'pending',
  )

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('dashboard.admin.title')}
          </h2>
          <p className="text-muted-foreground">{t('dashboard.admin.desc')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.admin.users')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,450</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.admin.users_desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.admin.jobs')}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">842</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.admin.jobs_desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.admin.volume')}
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(4500000)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.admin.volume_desc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.admin.premium')}
              </CardTitle>
              <HardHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">320</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.admin.premium_desc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // --- Contractor Specific KPIs (SPI/CPI) ---
  const isPJWithConstruction =
    isContractor && user?.entityType === 'pj' && user.isPremium

  // Calculate Global SPI and CPI for active projects
  const activeProjects = projects.filter((p) => p.status === 'in_progress')

  let globalSPI = 0
  let globalCPI = 0

  if (activeProjects.length > 0) {
    let totalEV = 0 // Earned Value
    let totalPV = 0 // Planned Value
    let totalAC = 0 // Actual Cost

    activeProjects.forEach((p) => {
      const progress =
        p.stages.length > 0
          ? p.stages.reduce((acc, s) => acc + s.progress, 0) / p.stages.length
          : 0
      const ev = p.totalBudget * (progress / 100)
      const ac = p.totalSpent

      const start = new Date(p.startDate).getTime()
      const end = new Date(p.endDate).getTime()
      const now = new Date().getTime()
      const totalDays = Math.max(1, (end - start) / 86400000)
      const elapsedDays = Math.max(0, (now - start) / 86400000)
      const expectedProgress = Math.min(1, elapsedDays / totalDays)
      const pv = p.totalBudget * expectedProgress

      totalEV += ev
      totalAC += ac
      totalPV += pv
    })

    globalSPI = totalPV > 0 ? totalEV / totalPV : 1
    globalCPI = totalAC > 0 ? totalEV / totalAC : 1
  }

  // Smart Alerts
  const docsExpiringSoon = documents.filter((d) => {
    if (!d.validity) return false
    const daysLeft = differenceInDays(new Date(d.validity), new Date())
    return daysLeft > 0 && daysLeft <= 30
  })

  const pendingInspections = activeProjects.flatMap((p) =>
    p.inspections
      .filter((i) => i.status === 'pending' || i.status === 'rejected')
      .map((i) => ({ ...i, projectName: p.name })),
  )

  // --- General Dashboard Logic ---
  const activeJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user?.id && j.status === 'in_progress')
        .length
    : jobs.filter(
        (j) =>
          j.bids.some((b) => b.executorId === user?.id) &&
          j.status === 'in_progress',
      ).length

  const completedJobs = isContractor
    ? jobs.filter((j) => j.ownerId === user?.id && j.status === 'completed')
        .length
    : jobs.filter(
        (j) =>
          j.bids.some((b) => b.executorId === user?.id) &&
          j.status === 'completed',
      ).length

  const earningsData = [
    { month: t('dashboard.months.jan'), value: 1200 },
    { month: t('dashboard.months.feb'), value: 1900 },
    { month: t('dashboard.months.mar'), value: 1500 },
    { month: t('dashboard.months.apr'), value: 2200 },
    { month: t('dashboard.months.may'), value: 2800 },
  ]

  const marketInsightsData = [
    { category: 'TI', avgPrice: 2500 },
    { category: 'Design', avgPrice: 1200 },
    { category: 'Reformas', avgPrice: 1800 },
    { category: 'Mkt', avgPrice: 1500 },
  ]

  const chartConfig = {
    value: {
      label: t('dashboard.chart.label.value'),
      color: 'hsl(var(--primary))',
    },
    avgPrice: {
      label: t('dashboard.chart.label.avg_price'),
      color: 'hsl(var(--chart-2))',
    },
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.role_label', {
              role: isContractor ? t('role.contractor') : t('role.executor'),
            })}{' '}
            |{' '}
            <span className="font-semibold text-primary capitalize">
              {t('dashboard.plan_label', {
                plan: user?.subscriptionTier || '',
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isContractor ? (
            <Button asChild>
              <Link to="/post-job">
                <Plus className="mr-2 h-4 w-4" /> {t('dashboard.post_job')}
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/find-jobs">
                <Search className="mr-2 h-4 w-4" /> {t('dashboard.find_jobs')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="border-b">
        <TabsList className="bg-transparent space-x-2">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
          >
            {t('dashboard.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger
            value="interests"
            className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
          >
            {t('dashboard.tabs.interests')}
            {myPendingInterests.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {myPendingInterests.length}
              </span>
            )}
          </TabsTrigger>
          {isContractor && (
            <TabsTrigger
              value="vendors"
              className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
            >
              Vendors
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6 mt-0">
        <AINotifications />

        <AdSection segment="dashboard" />

        {isPJWithConstruction && activeProjects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="border-t-4 border-t-primary shadow-sm bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {t('dashboard.kpi.spi')}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold">
                      {globalSPI.toFixed(2)}
                    </span>
                    <Badge
                      variant={globalSPI >= 1 ? 'default' : 'destructive'}
                      className={globalSPI >= 1 ? 'bg-green-500' : ''}
                    >
                      {globalSPI >= 1
                        ? t('dashboard.kpi.ahead')
                        : t('dashboard.kpi.delayed')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('dashboard.kpi.spi_desc')}
                  </p>
                </div>
                <Activity
                  className={`h-16 w-16 opacity-20 ${globalSPI >= 1 ? 'text-green-500' : 'text-red-500'}`}
                />
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 shadow-sm bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-4 w-4" /> {t('dashboard.kpi.cpi')}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold">
                      {globalCPI.toFixed(2)}
                    </span>
                    <Badge
                      variant={globalCPI >= 1 ? 'default' : 'destructive'}
                      className={globalCPI >= 1 ? 'bg-green-500' : ''}
                    >
                      {globalCPI >= 1
                        ? t('dashboard.kpi.on_budget')
                        : t('dashboard.kpi.over_budget')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('dashboard.kpi.cpi_desc')}
                  </p>
                </div>
                <Wallet
                  className={`h-16 w-16 opacity-20 ${globalCPI >= 1 ? 'text-green-500' : 'text-red-500'}`}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {isPJWithConstruction &&
          (docsExpiringSoon.length > 0 || pendingInspections.length > 0) && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />{' '}
                  {t('dashboard.alerts.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {docsExpiringSoon.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                    <h4 className="font-semibold text-sm text-orange-800 flex items-center gap-1 mb-2">
                      <FileText className="h-4 w-4" />{' '}
                      {t('dashboard.alerts.docs')}
                    </h4>
                    <ul className="space-y-2">
                      {docsExpiringSoon.map((doc) => (
                        <li
                          key={doc.id}
                          className="text-xs flex justify-between items-center"
                        >
                          <span className="truncate pr-2">{doc.name}</span>
                          <Badge variant="destructive" className="shrink-0">
                            {formatDate(new Date(doc.validity!), 'dd/MM/yy')}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pendingInspections.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                    <h4 className="font-semibold text-sm text-orange-800 flex items-center gap-1 mb-2">
                      <ShieldCheck className="h-4 w-4" />{' '}
                      {t('dashboard.alerts.inspections')}
                    </h4>
                    <ul className="space-y-2">
                      {pendingInspections.map((insp) => (
                        <li
                          key={insp.id}
                          className="text-xs flex flex-col gap-0.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{insp.name}</span>
                            <Badge
                              variant="outline"
                              className={
                                insp.status === 'rejected'
                                  ? 'text-red-600 bg-red-50 border-red-200'
                                  : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                              }
                            >
                              {insp.status === 'rejected'
                                ? t('dashboard.insp.rejected')
                                : t('dashboard.insp.pending')}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground truncate">
                            {t('dashboard.insp.project')}: {insp.projectName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.reputation')}
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.reputation.toFixed(1)}/5.0
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.jobs_finished', { count: completedJobs })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.active_jobs')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.active_jobs_desc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isContractor
                  ? t('dashboard.total_spent')
                  : t('dashboard.total_earned')}
              </CardTitle>
              <Wallet className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(9600)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />{' '}
                {t('dashboard.escrow_protected')}
              </p>
            </CardContent>
          </Card>

          {user?.role === 'executor' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.credits')}
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.credits}</div>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary"
                  asChild
                >
                  <Link to="/credits">{t('dashboard.buy_more')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>
                {isContractor
                  ? t('dashboard.chart.spent')
                  : t('dashboard.chart.earnings')}
              </CardTitle>
              <CardDescription>{t('dashboard.chart.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[250px]">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <LineChart data={earningsData}>
                    <XAxis
                      dataKey="month"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      stroke="var(--color-value)"
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>{t('dashboard.market_insights')}</CardTitle>
              <CardDescription>
                {t('dashboard.market_insights_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <BarChart data={marketInsightsData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="category"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Bar
                      dataKey="avgPrice"
                      fill="var(--color-avgPrice)"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="interests" className="space-y-6 mt-0">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <CardTitle>{t('dashboard.interests.title')}</CardTitle>
              <CardDescription>{t('dashboard.interests.desc')}</CardDescription>
            </div>
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  const mockSender = {
                    id: 'mock-' + Math.random().toString(36).substr(2, 5),
                    name:
                      `${t('dashboard.interests.simulate.sender')} ` +
                      Math.floor(Math.random() * 100),
                    avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${Math.random()}`,
                  }
                  sendInterest(mockSender, user.id, {
                    type: 'profile',
                    id: user.id,
                    title: t('dashboard.interests.simulate.title'),
                  })
                }}
              >
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />{' '}
                {t('dashboard.interests.simulate')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {myPendingInterests.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground flex flex-col items-center">
                <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                <p>{t('dashboard.interests.empty')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPendingInterests.map((interest) => (
                  <div
                    key={interest.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card shadow-sm gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarImage src={interest.senderAvatar} />
                        <AvatarFallback>
                          {interest.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to={`/profile/${interest.senderId}`}
                          className="font-semibold text-lg hover:underline hover:text-primary transition-colors"
                        >
                          {interest.senderName}
                        </Link>
                        {interest.context && (
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {interest.context.type === 'job'
                                ? t('dashboard.interests.type.job')
                                : t('dashboard.interests.type.profile')}
                            </Badge>
                            <span className="text-sm font-medium">
                              {interest.context.title}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('dashboard.interests.received_at')}{' '}
                          {formatDate(interest.createdAt, 'MM/dd/yyyy hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        onClick={() => declineInterest(interest.id)}
                      >
                        {t('dashboard.interests.decline')}
                      </Button>
                      <Button
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          const convId = acceptInterest(interest.id)
                          toast({
                            title: t('dashboard.interests.toast.title'),
                            description: t('dashboard.interests.toast.desc'),
                          })
                          navigate(
                            `/messages${convId ? `?conv=${convId}` : ''}`,
                          )
                        }}
                      >
                        {t('dashboard.interests.accept')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="vendors" className="space-y-6 mt-0">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Vendors Directory</CardTitle>
              <CardDescription>
                Manage your favorite service providers.
              </CardDescription>
            </div>
            <Button
              variant={showOnlyFavorites ? 'default' : 'outline'}
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className="gap-2"
            >
              <Star
                className={`h-4 w-4 ${showOnlyFavorites ? 'fill-current' : ''}`}
              />
              {showOnlyFavorites ? 'Showing Favorites' : 'Show Favorites Only'}
            </Button>
          </CardHeader>
          <CardContent>
            {displayedVendors.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                No vendors found.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedVendors.map((vendor) => (
                  <Card key={vendor.id} className="relative group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {vendor.name}
                          </h4>
                          <Badge variant="secondary" className="mt-1 mb-2">
                            {vendor.category || 'General'}
                          </Badge>
                          {vendor.email && (
                            <p className="text-sm text-muted-foreground">
                              {vendor.email}
                            </p>
                          )}
                          {vendor.phone && (
                            <p className="text-sm text-muted-foreground">
                              {vendor.phone}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(vendor.id)}
                          className="shrink-0"
                        >
                          <Star
                            className={`h-5 w-5 ${favorites.includes(vendor.id) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
