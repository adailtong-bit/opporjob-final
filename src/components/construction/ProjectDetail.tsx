import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore, ProjectPartner } from '@/stores/useProjectStore'
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
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectEstimationTable } from '@/components/construction/ProjectEstimationTable'
import { TemplateSelector } from '@/components/construction/TemplateSelector'
import { ProjectExecution } from '@/components/construction/ProjectExecution'
import { ProjectFinance } from '@/components/construction/ProjectFinance'
import { ProjectQuotes } from '@/components/construction/ProjectQuotes'
import { ProjectChat } from '@/components/construction/ProjectChat'
import { ProjectCompliance } from '@/components/construction/ProjectCompliance'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert, Store, ShoppingCart } from 'lucide-react'
import { useMaterialStore } from '@/stores/useMaterialStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectPurchasing } from '@/components/construction/ProjectPurchasing'
import { ProjectUpdates } from '@/components/construction/ProjectUpdates'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject, setProjectSqFt, updateProjectPreferredVendor } =
    useProjectStore()
  const { vendors } = useMaterialStore()
  const { toast } = useToast()
  const { t, formatDate, currentLanguage } = useLanguageStore()

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
  const [currentTab, setCurrentTab] = useState('financial')

  // Estimation State
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)

  if (!project) return <div className="p-8 text-center">{t('error')}</div>

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: t('proj.import.simulation') || 'Simulação',
      description: t('proj.import.success') || 'Upload feito com sucesso.',
    })
    setIsImportOpen(false)
  }

  // Check for critical expired documents
  const today = new Date()
  const criticalExpiredDocs = (project.complianceDocuments || []).filter(
    (doc) => doc.isCritical && new Date(doc.expirationDate) < today,
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
        <div className="bg-purple-100 border border-purple-200 text-purple-800 px-4 py-3 rounded-md flex items-center gap-3 shadow-sm mb-4">
          <Star className="h-5 w-5 text-purple-600" />
          <p className="text-sm font-medium">
            {t('demo.notification') ||
              'This is a demonstration project to showcase platform features.'}
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
            <Badge
              variant={
                project.status === 'in_progress' ? 'default' : 'secondary'
              }
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              {t(`status.${project.status}`)}
            </Badge>
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground text-left w-full break-words">
            {project.name}
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

            <div className="flex items-center gap-1.5 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-blue-100 dark:border-blue-800 text-[11px] sm:text-xs md:text-sm max-w-full">
              <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="font-medium mr-1 truncate hidden sm:inline">
                {t('proj.preferred_vendor', undefined) || 'Preferred Vendor:'}
              </span>
              <span className="font-medium mr-1 truncate inline sm:hidden">
                {t('proj.vendor_short', undefined) || 'Vendor:'}
              </span>
              <Select
                value={project.preferredVendorId || 'none'}
                onValueChange={(val) =>
                  updateProjectPreferredVendor(
                    project.id,
                    val === 'none' ? undefined : val,
                  )
                }
              >
                <SelectTrigger className="h-6 w-auto min-w-[100px] text-[11px] sm:text-xs border-none bg-transparent shadow-none focus:ring-0 px-1 hover:bg-blue-100/50 dark:hover:bg-blue-800/30 rounded">
                  <SelectValue
                    placeholder={t('general.none', undefined) || 'None'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('general.none', undefined) || 'None'}
                  </SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="w-full flex flex-col min-w-0"
      >
        {/* Mobile Dropdown Navigation */}
        <div className="md:hidden w-full mb-5">
          <div className="bg-card border shadow-sm rounded-lg p-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block px-1">
              {t('nav.project_menu', undefined) || 'Project Menu'}
            </label>
            <Select value={currentTab} onValueChange={setCurrentTab}>
              <SelectTrigger className="w-full bg-background border-border hover:border-primary/50 font-medium h-10 rounded-md transition-colors text-sm shadow-sm focus:ring-1 focus:ring-primary/30">
                <SelectValue
                  placeholder={
                    t('nav.select_section', undefined) || 'Select a section'
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh] overflow-y-auto">
                <SelectItem value="financial">
                  {t('nav.financials', undefined) || 'Financials'}
                </SelectItem>
                <SelectItem value="purchasing">
                  {t('nav.purchasing', undefined) || 'Purchasing'}
                </SelectItem>
                <SelectItem value="stages">
                  {t('proj.detail.schedule')}
                </SelectItem>
                <SelectItem value="budget">{t('proj.budget.title')}</SelectItem>
                <SelectItem value="estimation">{t('est.tab.title')}</SelectItem>
                <SelectItem value="execution">
                  {t('proj.detail.financial_execution') || 'Execution'}
                </SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
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
              value="financial"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('nav.financials', undefined) || 'Financials'}
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
              value="execution"
              className="whitespace-nowrap px-4 py-2.5 text-sm"
            >
              {t('proj.detail.financial_execution') || 'Execution'}
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

        {/* Financial Tab (Integrated View) */}
        <TabsContent
          value="financial"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectFinance projectId={project.id} />
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
                    min={0}
                    className="h-7 w-20 text-right"
                    value={project.sqFt || ''}
                    placeholder="0"
                    onChange={(e) =>
                      setProjectSqFt(
                        project.id,
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
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
        <TabsContent
          value="budget"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectBudget projectId={project.id} />
        </TabsContent>

        {/* Execution Tab */}
        <TabsContent
          value="execution"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectExecution projectId={project.id} />
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent
          value="partners"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
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
                            {partner.email ||
                              t('general.no_email', undefined) ||
                              'Email not registered'}{' '}
                            •{' '}
                            {partner.phone ||
                              t('general.no_phone', undefined) ||
                              'Phone not registered'}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {partner.address
                              ? `${partner.address.street}, ${partner.address.city} - ${partner.address.state}`
                              : t('general.no_address', undefined) ||
                                'No address registered'}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {partner.specialty ||
                                t('general.general_specialty', undefined) ||
                                'General Specialty'}
                            </Badge>
                            <Badge variant="outline">
                              {t('proj.partner.stage')}:{' '}
                              {t(
                                project.stages.find(
                                  (s) => s.id === partner.stageId,
                                )?.name || 'general.general',
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
        <TabsContent
          value="quotes"
          className="w-full min-w-0 animate-fade-in overflow-x-auto"
        >
          <ProjectQuotes projectId={project.id} />
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
