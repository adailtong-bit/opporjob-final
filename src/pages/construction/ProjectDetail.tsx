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
  Star,
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
import { supabase } from '@/lib/supabase/client'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { ProjectUpdates } from '@/components/construction/ProjectUpdates'
import { ProjectOverview } from '@/components/construction/ProjectOverview'
import { ProjectPartners } from '@/components/construction/ProjectPartners'
import { ProjectInvoices } from '@/components/construction/ProjectInvoices'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { getProject, setProjectSqFt, updateProject } = useProjectStore()
  const { equipment, returnEquipment } = useEquipmentStore()
  const { user } = useAuthStore()
  const { upsertNotification } = useNotificationStore()
  const { toast } = useToast()
  const { t, formatDate, currentLanguage, formatCurrency } = useLanguageStore()

  const currentTab = searchParams.get('tab') || 'overview'

  const csvInputRef = useRef<HTMLInputElement>(null)
  const [dbProject, setDbProject] = useState<any>(null)

  useEffect(() => {
    const fetchDbProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        if (data.is_demo) {
          setDbProject({
            id: data.id,
            name: data.name,
            description: data.description,
            status: data.status,
            totalBudget: data.total_budget || 0,
            totalSpent: 0,
            progress: data.progress || 0,
            is_demo: data.is_demo,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            location: 'Virtual Site',
            stages: [
              {
                id: '1',
                name: 'Foundation',
                status: 'completed',
                progress: 100,
                startDate: new Date(),
                endDate: new Date(),
                budgetMaterial: 10000,
                budgetLabor: 5000,
                actualMaterial: 10000,
                actualLabor: 5000,
                subStages: [],
              },
              {
                id: '2',
                name: 'Structure',
                status: 'in_progress',
                progress: 50,
                startDate: new Date(),
                endDate: new Date(),
                budgetMaterial: 20000,
                budgetLabor: 10000,
                actualMaterial: 15000,
                actualLabor: 8000,
                subStages: [],
              },
            ],
            partners: [],
            complianceDocuments: [],
            ledgerEntries: [
              {
                id: '1',
                description: 'Permits',
                estimatedCost: 5000,
                finalCost: 5000,
                status: 'paid',
                date: new Date().toISOString(),
                category: 'Soft Costs',
              },
            ],
            updates: [],
            photos: data.photos || [],
          })
        } else {
          const { data: partnersData } = await supabase
            .from('project_partners')
            .select('*, vendors(*)')
            .eq('project_id', id)

          setDbProject({
            id: data.id,
            name: data.name,
            description: data.description,
            status: data.status,
            totalBudget: data.total_budget || 0,
            totalSpent: 0,
            progress: data.progress || 0,
            is_demo: data.is_demo,
            startDate: data.created_at ? new Date(data.created_at) : new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            location: 'Site',
            stages: [],
            partners:
              partnersData?.map((p: any) => ({
                id: p.vendor_id,
                companyName: p.vendors?.name || 'Unknown',
                role: p.role,
                team: [],
                contacts: [],
              })) || [],
            complianceDocuments: [],
            ledgerEntries: [],
            updates: [],
            photos: data.photos || [],
          })
        }
      }
    }
    if (id && !getProject(id)) {
      fetchDbProject()
    }
  }, [id, getProject])

  const project = getProject(id!) || dbProject

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
    <div className="space-y-4 sm:space-y-8 w-full max-w-6xl mx-auto pb-24 md:pb-10 px-3 sm:px-4 min-w-0">
      {/* Visual Safeguard Warning */}
      {criticalExpiredDocs.length > 0 && (
        <Alert
          variant="destructive"
          className="mt-4 bg-red-50/90 text-red-900 border-red-200 shadow-sm"
        >
          <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
          <AlertTitle className="text-sm sm:text-base font-bold mb-1">
            {t('alert.operational_risk', undefined) || 'Operational Risk Alert'}
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm leading-relaxed break-words">
            {t('alert.expired_docs_msg_1', undefined) || 'There are'}{' '}
            <strong>{criticalExpiredDocs.length}</strong>{' '}
            {t('alert.expired_docs_msg_2', undefined) ||
              'expired critical document(s). Imminent risk of project stoppage. Access the Compliance tab to regularize.'}
          </AlertDescription>{' '}
        </Alert>
      )}

      {(project as any).is_demo && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-md flex items-center gap-3 shadow-sm mb-4">
          <Star className="h-5 w-5 text-amber-600" />
          <p className="text-sm font-medium">
            {t('demo.notification') ||
              'This is a demonstration listing to showcase platform features.'}
          </p>
        </div>
      )}

      {/* Refactored Header */}
      <div className="flex flex-col gap-3 sm:gap-5 py-3 sm:py-6 min-w-0">
        {/* Top Bar: Navigation, Status & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-background hover:bg-muted"
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
                  className="cursor-pointer hover:opacity-80 flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  {t(`status.${project.status}`)}{' '}
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'planning' })
                  }
                >
                  {t('status.planning', undefined) || 'Planning'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'in_progress' })
                  }
                >
                  {t('status.in_progress', undefined) || 'In Progress'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'finalizing' })
                  }
                >
                  {t('status.finalizing', undefined) || 'Finalizing'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateProject(project.id, { status: 'paused' })
                  }
                >
                  {t('status.paused', undefined) || 'Paused'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCompleteProject}
                  className="text-green-600 font-medium"
                >
                  {t('action.complete_project', undefined) ||
                    'Complete Project'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
            <Button
              asChild
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4"
            >
              <Link to={`/construction/materials?projectId=${project.id}`}>
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 shrink-0" />{' '}
                <span className="hidden min-[400px]:inline">
                  {t('action.new_purchase', undefined) || 'New Purchase'}
                </span>
                <span className="inline min-[400px]:hidden">
                  {t('action.buy', undefined) || 'Buy'}
                </span>
              </Link>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative bg-background hover:bg-muted h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                  title={t('nav.notifications', undefined) || 'Notifications'}
                >
                  <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {(expiring15DaysDocs.length > 0 ||
                    budgetOverruns.length > 0) && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">
                    {t('alert.project_alerts', undefined) || 'Project Alerts'}
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {expiring15DaysDocs.length === 0 &&
                      budgetOverruns.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {t('alert.all_good', undefined) ||
                            'All good! No notifications.'}
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
                            {t('alert.expiring_doc', undefined) ||
                              'Expiring Document'}
                          </p>
                          <p className="text-[10px] text-yellow-800">
                            {doc.name}{' '}
                            {t('alert.expires_in', undefined) || 'expires in'}{' '}
                            {Math.ceil(
                              (new Date(doc.expirationDate).getTime() -
                                todayDate.getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{' '}
                            {t('alert.days', undefined) || 'days.'}
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
                            {t('alert.budget_overrun', undefined) ||
                              'Budget Overrun'}
                          </p>
                          <p className="text-[10px] text-red-800">
                            {entry.description}:{' '}
                            {t('alert.final_cost', undefined) || 'Final cost ('}
                            {formatCurrency(entry.finalCost)}){' '}
                            {t('alert.exceeded_planned', undefined) ||
                              'exceeded planned ('}
                            {formatCurrency(entry.estimatedCost)}).
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
              title={t('nav.field_entry', undefined) || 'Field Entry (Mobile)'}
              className="bg-background hover:bg-muted h-8 w-8 sm:h-10 sm:w-10 shrink-0"
            >
              <Link to="/construction/field-entry">
                <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSyncOpen(true)}
              title={t('proj.sync.btn')}
              className="bg-background hover:bg-muted h-8 w-8 sm:h-10 sm:w-10 shrink-0"
            >
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsChatOpen(true)}
              title={t('nav.project_chat', undefined) || 'Project Chat'}
              className="bg-background hover:bg-muted h-8 w-8 sm:h-10 sm:w-10 shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTeamManagerOpen(true)}
              className="hidden md:flex bg-background hover:bg-muted h-10"
            >
              <HardHat className="mr-2 h-4 w-4 shrink-0" /> {t('proj.team.btn')}
            </Button>
          </div>
        </div>

        {/* Title & Info */}
        <div className="flex flex-col items-start gap-2.5 w-full mt-1 sm:mt-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground text-left w-full break-words flex flex-wrap items-center gap-2 sm:gap-3">
            {project.name}
            {(project as any).is_demo && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider text-[10px] uppercase">
                {t('demo.badge') || 'DEMO'}
              </Badge>
            )}
          </h1>

          <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 text-sm text-muted-foreground w-full">
            <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[11px] sm:text-xs md:text-sm max-w-full">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">
                {project.address
                  ? `${project.address.city} - ${project.address.state}`
                  : project.location}
              </span>
            </span>
            <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full whitespace-nowrap border text-[11px] sm:text-xs md:text-sm">
              <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />{' '}
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
        {/* Mobile Dropdown Navigation */}
        <div className="md:hidden w-full mb-5">
          <div className="bg-card border shadow-sm rounded-lg p-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">
              {t('nav.project_menu', undefined) || 'Project Menu'}
            </label>
            <Select value={currentTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full bg-background border-border hover:border-primary/50 font-medium h-10 rounded-md transition-colors text-sm shadow-sm focus:ring-1 focus:ring-primary/30">
                <SelectValue
                  placeholder={
                    t('nav.select_section', undefined) || 'Select a section'
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh] overflow-y-auto">
                <SelectItem value="overview">
                  {t('nav.overview', undefined) || 'Overview'}
                </SelectItem>
                <SelectItem value="financial">
                  {t('nav.financial_dashboard', undefined) ||
                    'Financial Dashboard'}
                </SelectItem>
                <SelectItem value="equipment">
                  {t('nav.equipment', undefined) || 'Equipment'}
                </SelectItem>
                <SelectItem value="purchasing">
                  {t('nav.purchasing', undefined) || 'Purchasing'}
                </SelectItem>
                <SelectItem value="stages">
                  {t('proj.detail.schedule')}
                </SelectItem>
                <SelectItem value="budget">{t('proj.budget.title')}</SelectItem>
                <SelectItem value="estimation">{t('est.tab.title')}</SelectItem>
                <SelectItem value="compliance">
                  {t('nav.compliance', undefined) || 'Compliance'}
                </SelectItem>
                <SelectItem value="partners">
                  {t('proj.detail.partners')}
                </SelectItem>
                <SelectItem value="quotes">
                  {t('nav.invoices', undefined) || 'Invoices'}
                </SelectItem>
                <SelectItem value="approvals">
                  {t('proj.approvals.title')}
                </SelectItem>
                <SelectItem value="reports">
                  {t('proj.reports.title')}
                </SelectItem>
                <SelectItem value="updates">
                  {t('proj.updates.title') || 'Updates'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Responsive Horizontal Scroll Tabs */}
        <div className="hidden md:block w-full overflow-x-auto pb-4 -mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="flex w-max min-w-full lg:w-auto lg:min-w-0 flex-nowrap justify-start lg:justify-center mx-auto mb-8 h-auto p-1.5 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="overview"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('nav.overview', undefined) || 'Overview'}
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('nav.financial_dashboard', undefined) || 'Financial Dashboard'}
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('nav.equipment', undefined) || 'Equipment'}
            </TabsTrigger>
            <TabsTrigger
              value="purchasing"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('nav.purchasing', undefined) || 'Purchasing'}
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
              {t('nav.compliance', undefined) || 'Compliance'}
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
              {t('nav.invoices', undefined) || 'Invoices'}
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
            <TabsTrigger
              value="updates"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.updates.title') || 'Updates'}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectOverview
            projectId={project.id}
            progress={project.progress || 0}
          />
        </TabsContent>

        {/* Financial Tab (Integrated View) */}
        <TabsContent
          value="financial"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectFinance projectId={project.id} />
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent
          value="equipment"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectEquipment projectId={project.id} />
        </TabsContent>

        {/* Purchasing Tab */}
        <TabsContent
          value="purchasing"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectPurchasing projectId={project.id} />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent
          value="compliance"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectCompliance projectId={project.id} />
        </TabsContent>

        <TabsContent
          value="estimation"
          className="w-full min-w-0 animate-fade-in space-y-6 overflow-x-auto"
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
          className="w-full min-w-0 space-y-6 animate-fade-in overflow-x-auto"
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
                          {formatDate(stage.startDate, 'dd/MM/yyyy')}
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
        <TabsContent
          value="budget"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectBudget projectId={project.id} />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent
          value="partners"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectPartners projectId={project.id} />
        </TabsContent>

        {/* Quotes & Invoices Tab */}
        <TabsContent
          value="quotes"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectInvoices projectId={project.id} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent
          value="reports"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectReports projectId={project.id} />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent
          value="approvals"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectApprovalWorkflow projectId={project.id} />
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent
          value="updates"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectUpdates projectId={project.id} />
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
