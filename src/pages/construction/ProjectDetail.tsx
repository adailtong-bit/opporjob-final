import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useProjectStore, ProjectPartner } from '@/stores/useProjectStore'
import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon,
  LayoutList,
  LayoutGrid,
  FileSpreadsheet,
  Upload,
  Edit2,
  Phone,
  Users,
  HardHat,
  Link2,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  Bell,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { PartnerEditModal } from '@/components/partner/PartnerEditModal'
import { ProjectTeamManager } from '@/components/construction/ProjectTeamManager'
import { ProjectBudget } from '@/components/construction/ProjectBudget'
import { ProjectReports } from '@/components/construction/ProjectReports'
import { ProjectApprovalWorkflow } from '@/components/construction/ProjectApprovalWorkflow'
import { ExternalIntegrationDialog } from '@/components/construction/ExternalIntegrationDialog'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProjectEstimationTable } from '@/components/construction/ProjectEstimationTable'
import { TemplateSelector } from '@/components/construction/TemplateSelector'
import { ProjectFinance } from '@/components/construction/ProjectFinance'
import { ProjectQuotes } from '@/components/construction/ProjectQuotes'
import { ProjectChat } from '@/components/construction/ProjectChat'
import { ProjectCompliance } from '@/components/construction/ProjectCompliance'
import { ProjectEquipment } from '@/components/construction/ProjectEquipment'
import { ProjectPurchasing } from '@/components/construction/ProjectPurchasing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ShoppingCart } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { getProject, setProjectSqFt, updateProject } = useProjectStore()
  const { equipment, returnEquipment } = useEquipmentStore()
  const { user } = useAuthStore()
  const { upsertNotification } = useNotificationStore()
  const { toast } = useToast()
  const { t, formatDate, currentLanguage, formatCurrency } = useLanguageStore()

  const currentTab = searchParams.get('tab') || 'financial'

  const csvInputRef = useRef<HTMLInputElement>(null)
  const project = getProject(id!)

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<ProjectPartner | null>(
    null,
  )
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false)
  const [isSyncOpen, setIsSyncOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Estimation State
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)

  // Trigger Notifications for Expirations and Budget Overflow
  useEffect(() => {
    if (!project || !user) return

    // Compliance alerts
    const today = new Date()
    project.complianceDocuments?.forEach((doc) => {
      if (!doc.isCritical) return
      const exp = new Date(doc.expirationDate)
      const diffDays = Math.ceil(
        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (diffDays <= (project.alertLeadTimeDays || 30)) {
        upsertNotification({
          userId: user.id,
          title: `Documento Vencendo/Vencido: ${doc.name}`,
          message: `O documento crítico requer atenção (Projeto: ${project.name}).`,
          type: diffDays < 0 ? 'error' : 'warning',
          link: `/construction/projects/${project.id}?tab=compliance`,
          referenceId: `doc-${doc.id}-${project.id}`,
        })
      }
    })

    // Budget overflow alerts
    project.ledgerEntries?.forEach((entry) => {
      if (entry.finalCost > entry.estimatedCost) {
        upsertNotification({
          userId: user.id,
          title: `Alerta de Orçamento: ${entry.description}`,
          message: `O custo final excedeu o previsto no painel financeiro (Projeto: ${project.name}).`,
          type: 'error',
          link: `/construction/projects/${project.id}?tab=financial`,
          referenceId: `budget-overrun-${entry.id}-${project.id}`,
        })
      }
    })
  }, [project, user, upsertNotification])

  if (!project) return <div className="p-8 text-center">{t('error')}</div>

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: t('proj.import.simulation') || 'Simulação de Upload',
      description:
        t('proj.import.success') || 'Arquivo processado com sucesso.',
    })
    setIsImportOpen(false)
  }

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  const handleCompleteProject = () => {
    updateProject(project.id, { status: 'completed' })
    const projectEqs = equipment.filter((e) => e.projectId === project.id)
    projectEqs.forEach((eq) => returnEquipment(eq.id))
    toast({
      title: 'Projeto Concluído',
      description: 'As máquinas alocadas foram devolvidas ao pátio.',
    })
  }

  // Check for critical expired documents
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const criticalExpiredDocs = (project.complianceDocuments || []).filter(
    (doc) => doc.isCritical && new Date(doc.expirationDate) < todayDate,
  )

  const expiring15DaysDocs = (project.complianceDocuments || []).filter(
    (doc) => {
      const exp = new Date(doc.expirationDate)
      exp.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil(
        (exp.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      return diffDays > 0 && diffDays <= 15
    },
  )

  const budgetOverruns = (project.ledgerEntries || []).filter(
    (entry) => entry.finalCost > entry.estimatedCost * 1.1, // 10% tolerance for alert
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10 px-4 min-w-0">
      {/* Visual Safeguard Warning */}
      {criticalExpiredDocs.length > 0 && (
        <Alert
          variant="destructive"
          className="mt-4 bg-red-50 text-red-900 border-red-200"
        >
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Alerta de Risco Operacional!</AlertTitle>
          <AlertDescription>
            Existem <strong>{criticalExpiredDocs.length}</strong> documento(s)
            crítico(s) vencido(s). Risco iminente de paralisação da obra. Acesse
            a aba de Compliance para regularizar.
          </AlertDescription>
        </Alert>
      )}

      {/* Refactored Header */}
      <div className="flex flex-col gap-6 py-6 min-w-0">
        {/* Top Bar: Navigation, Status & Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="shrink-0 bg-background hover:bg-muted"
            >
              <Link to="/construction/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant={
                    project.status === 'in_progress' ? 'default' : 'secondary'
                  }
                  className="cursor-pointer hover:opacity-80 flex items-center gap-1 px-3 py-1.5 text-sm"
                >
                  {t(`status.${project.status}`)}{' '}
                  <ChevronDown className="h-3 w-3" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'planning' })
                  }
                >
                  Planejamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'in_progress' })
                  }
                >
                  Em Progresso
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'paused' })
                  }
                >
                  Pausado
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCompleteProject}
                  className="text-green-600 font-medium"
                >
                  Concluir Projeto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            <Button
              asChild
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Link to={`/construction/materials?projectId=${project.id}`}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Nova Compra
              </Link>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative bg-background hover:bg-muted"
                  title="Notificações"
                >
                  <Bell className="h-4 w-4" />
                  {(expiring15DaysDocs.length > 0 ||
                    budgetOverruns.length > 0) && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Alertas do Projeto</h4>
                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {expiring15DaysDocs.length === 0 &&
                      budgetOverruns.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Tudo certo! Nenhuma notificação.
                        </p>
                      )}
                    {expiring15DaysDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex gap-2 items-start bg-yellow-50 p-2 rounded-md border border-yellow-200"
                      >
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-900">
                            Documento Vencendo
                          </p>
                          <p className="text-[10px] text-yellow-800">
                            {doc.name} vence em{' '}
                            {Math.ceil(
                              (new Date(doc.expirationDate).getTime() -
                                todayDate.getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{' '}
                            dias.
                          </p>
                        </div>
                      </div>
                    ))}
                    {budgetOverruns.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex gap-2 items-start bg-red-50 p-2 rounded-md border border-red-200"
                      >
                        <TrendingUp className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-red-900">
                            Estouro de Orçamento
                          </p>
                          <p className="text-[10px] text-red-800">
                            {entry.description}: Custo final (
                            {formatCurrency(entry.finalCost)}) excedeu o
                            previsto ({formatCurrency(entry.estimatedCost)}).
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              asChild
              title="Apontamento (Mobile)"
              className="bg-background hover:bg-muted"
            >
              <Link to="/construction/field-entry">
                <Smartphone className="h-4 w-4 text-primary" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSyncOpen(true)}
              title={t('proj.sync.btn')}
              className="bg-background hover:bg-muted"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsChatOpen(true)}
              title="Chat do Projeto"
              className="bg-background hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTeamManagerOpen(true)}
              className="hidden sm:flex bg-background hover:bg-muted"
            >
              <HardHat className="mr-2 h-4 w-4" /> {t('proj.team.btn')}
            </Button>
          </div>
        </div>

        {/* Title & Info */}
        <div className="flex flex-col items-center md:items-start gap-3 w-full">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground truncate max-w-full text-center md:text-left w-full px-2 md:px-0">
            {project.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground w-full">
            <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full whitespace-nowrap border">
              <MapPin className="h-3.5 w-3.5" />
              {project.address
                ? `${project.address.city} - ${project.address.state}`
                : project.location}
            </span>
            <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full whitespace-nowrap border">
              <CalendarIcon className="h-3.5 w-3.5" />{' '}
              {formatDate(project.startDate, 'P')} -{' '}
              {formatDate(project.endDate, 'P')}
            </span>
          </div>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full flex flex-col min-w-0"
      >
        {/* Responsive Horizontal Scroll Tabs */}
        <div className="w-full overflow-x-auto pb-4 -mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="flex w-max min-w-full lg:w-auto lg:min-w-0 flex-nowrap justify-start lg:justify-center mx-auto mb-8 h-auto p-1.5 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="financial"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              Painel Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              Máquinas
            </TabsTrigger>
            <TabsTrigger
              value="purchasing"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              Compras
            </TabsTrigger>
            <TabsTrigger
              value="stages"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.detail.schedule')}
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.budget.title')}
            </TabsTrigger>
            <TabsTrigger
              value="estimation"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('est.tab.title')}
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="partners"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.detail.partners')}
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              Faturas
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.approvals.title')}
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.reports.title')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Financial Tab (Integrated View) */}
        <TabsContent
          value="financial"
          className="w-full min-w-0 animate-fade-in"
        >
          <ProjectFinance projectId={project.id} />
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent
          value="equipment"
          className="w-full min-w-0 animate-fade-in"
        >
          <ProjectEquipment projectId={project.id} />
        </TabsContent>

        {/* Purchasing Tab */}
        <TabsContent
          value="purchasing"
          className="w-full min-w-0 animate-fade-in"
        >
          <ProjectPurchasing projectId={project.id} />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent
          value="compliance"
          className="w-full min-w-0 animate-fade-in"
        >
          <ProjectCompliance projectId={project.id} />
        </TabsContent>

        <TabsContent
          value="estimation"
          className="w-full min-w-0 animate-fade-in space-y-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>{t('est.tab.title')}</CardTitle>
                <CardDescription>
                  {t('est.desc') || 'Planejamento e estimativa de custos.'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border rounded-md p-1 mr-4">
                  <span className="text-xs font-medium px-2">
                    {t('est.project.sqft')}:
                  </span>
                  <Input
                    type="number"
                    className="h-7 w-20 text-right"
                    value={project.sqFt || ''}
                    placeholder="0"
                    onChange={(e) =>
                      setProjectSqFt(project.id, parseFloat(e.target.value))
                    }
                  />
                </div>
                <Button
                  onClick={() => setIsTemplateSelectorOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                  {t('est.template.select')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.constructionItems &&
              project.constructionItems.length > 0 ? (
                <ProjectEstimationTable projectId={project.id} />
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    {t('est.template.select')}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {t('est.empty.desc') ||
                      'Comece selecionando um modelo padrão.'}
                  </p>
                  <Button onClick={() => setIsTemplateSelectorOpen(true)}>
                    {t('est.template.select')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="stages"
          className="w-full min-w-0 space-y-6 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2">
                {t('proj.view_label')}
              </span>
              <div className="flex bg-muted p-1 rounded-md">
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="mr-2 h-3 w-3" /> {t('proj.view.cards')}
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setViewMode('table')}
                >
                  <LayoutList className="mr-2 h-3 w-3" /> {t('proj.view.table')}
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> {t('proj.import')}
            </Button>
          </div>

          <div className="rounded-xl overflow-hidden w-full">
            {viewMode === 'table' ? (
              <div className="bg-card border shadow-sm rounded-xl overflow-x-auto w-full">
                <ProjectScheduleTable
                  projectId={project.id}
                  stages={project.stages}
                  partners={project.partners}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.stages.map((stage) => (
                  <Card
                    key={stage.id}
                    className="h-full flex flex-col hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="outline"
                          className={
                            stage.status === 'completed'
                              ? 'bg-green-50 text-green-700'
                              : stage.status === 'delayed'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : ''
                          }
                        >
                          {t(`status.${stage.status}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(
                            stage.startDate,
                            currentLanguage === 'en' ? 'MM/dd' : 'dd/MM',
                          )}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight mt-2">
                        {t(stage.name)}
                      </CardTitle>
                      <Progress value={stage.progress} className="h-1.5 mt-2" />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3 mt-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          {t('proj.stage.tasks')}
                        </h4>
                        {stage.subStages.length > 0 ? (
                          <ul className="space-y-2">
                            {stage.subStages.map((sub) => (
                              <li
                                key={sub.id}
                                className="text-sm flex items-center gap-2 bg-muted/30 p-2 rounded"
                              >
                                {sub.status === 'completed' ? (
                                  <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                                )}
                                <span
                                  className={
                                    sub.status === 'completed'
                                      ? 'line-through text-muted-foreground'
                                      : ''
                                  }
                                >
                                  {t(sub.name)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            {t('proj.tasks.empty')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="w-full min-w-0 animate-fade-in">
          <ProjectBudget projectId={project.id} />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent
          value="partners"
          className="w-full min-w-0 animate-fade-in"
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t('proj.detail.partners')}</CardTitle>
                  <CardDescription>
                    {t('proj.partners.desc') ||
                      'Gestão de parceiros, equipes e contratos associados.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.partners && project.partners.length > 0 ? (
                <div className="grid gap-6">
                  {project.partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="border rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                          <h3 className="font-bold text-xl text-primary">
                            {partner.companyName}
                          </h3>
                          <div className="text-sm font-medium mt-1">
                            {partner.email || 'Email não cadastrado'} •{' '}
                            {partner.phone || 'Telefone não cadastrado'}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {partner.address
                              ? `${partner.address.street}, ${partner.address.city} - ${partner.address.state}`
                              : 'Sem endereço cadastrado'}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {partner.specialty || 'Especialidade Geral'}
                            </Badge>
                            <Badge variant="outline">
                              {t('proj.partner.stage')}:{' '}
                              {t(
                                project.stages.find(
                                  (s) => s.id === partner.stageId,
                                )?.name || 'Geral',
                              )}
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                              {t('proj.partner.score')}:{' '}
                              {partner.performanceScore}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPartner(partner)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> {t('edit')}
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Phone className="h-3 w-3" />{' '}
                            {t('proj.partner.contacts')}
                          </h4>
                          {partner.contacts.length > 0 ? (
                            <ul className="space-y-2">
                              {partner.contacts.map((c) => (
                                <li
                                  key={c.id}
                                  className="text-sm flex justify-between items-center bg-muted/30 p-2 rounded"
                                >
                                  <span className="font-medium">{c.name}</span>
                                  <div className="text-right">
                                    <span className="text-xs text-muted-foreground block">
                                      {c.email}
                                    </span>
                                    <span className="text-xs text-muted-foreground block">
                                      {c.phone}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              {t('proj.partner.no_contacts')}
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Users className="h-3 w-3" /> {t('proj.team.btn')}
                          </h4>
                          {partner.team.length > 0 ? (
                            <ul className="space-y-2">
                              {partner.team.map((m) => (
                                <li
                                  key={m.id}
                                  className="text-sm flex justify-between items-center bg-muted/30 p-2 rounded"
                                >
                                  <span className="font-medium">{m.name}</span>
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    {t(
                                      `role.${m.role.toLowerCase().replace(' ', '_')}`,
                                    ) || m.role}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              {t('proj.partner.no_team')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                  {t('proj.partners.empty') || 'Nenhum parceiro adicionado'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes & Invoices Tab */}
        <TabsContent value="quotes" className="w-full min-w-0 animate-fade-in">
          <ProjectQuotes projectId={project.id} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="w-full min-w-0 animate-fade-in">
          <ProjectReports projectId={project.id} />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent
          value="approvals"
          className="w-full min-w-0 animate-fade-in"
        >
          <ProjectApprovalWorkflow projectId={project.id} />
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('proj.import')}</DialogTitle>
          </DialogHeader>
          <div
            className="py-12 text-center cursor-pointer border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">{t('proj.import.drag_drop')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('proj.import.formats')}
            </p>
            <input
              type="file"
              ref={csvInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selector Dialog */}
      <TemplateSelector
        open={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        projectId={project.id}
      />

      {/* Edit Partner Modal */}
      {editingPartner && (
        <PartnerEditModal
          open={!!editingPartner}
          onClose={() => setEditingPartner(null)}
          projectId={project.id}
          partner={editingPartner}
        />
      )}

      {/* Team Manager Sheet */}
      <ProjectTeamManager
        open={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
        projectId={project.id}
      />

      {/* External Integration Dialog */}
      <ExternalIntegrationDialog
        open={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        projectId={project.id}
      />

      {/* Integrated Chat Drawer */}
      <ProjectChat
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        projectId={project.id}
      />
    </div>
  )
}
