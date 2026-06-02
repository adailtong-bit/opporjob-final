import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useContractorStore } from '@/stores/useContractorStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Users,
  FileText,
  Star,
  Plus,
  UserCheck,
  Trash2,
} from 'lucide-react'
import { ProjectScheduleTable } from '@/components/construction/ProjectScheduleTable'
import { TeamMemberModal } from '@/components/partner/TeamMemberModal'
import { VendorsTabContent } from '@/components/partner/VendorsTabContent'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'

export default function PartnerDashboard() {
  const { user } = useAuthStore()
  const { projects, addPartnerTeamMember, addQuote } = useProjectStore()
  const { contractors } = useContractorStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false)
  const [selectedContractorId, setSelectedContractorId] = useState('')

  // Quote State
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [selectedProjectForQuote, setSelectedProjectForQuote] = useState('')
  const [quoteItems, setQuoteItems] = useState<
    { id: string; description: string; amount: number }[]
  >([])
  const [quoteDesc, setQuoteDesc] = useState('')
  const [quoteAmount, setQuoteAmount] = useState(0)

  // Assume current logged in partner is 'partner-1' for demo
  const partnerId = 'partner-1'

  const partnerProjects = projects.filter((p) =>
    p.partners.some((part) => part.id === partnerId),
  )
  const activePartner = partnerProjects[0]?.partners.find(
    (p) => p.id === partnerId,
  )

  const availableContractors = contractors.filter(
    (c) => c.status === 'available',
  )

  const handleAddFromPool = () => {
    if (!selectedContractorId || !activePartner) return
    const contractor = contractors.find((c) => c.id === selectedContractorId)

    if (contractor && partnerProjects.length > 0) {
      const projectId = partnerProjects[0].id

      addPartnerTeamMember(projectId, activePartner.id, {
        name: contractor.name,
        role: contractor.role as any,
        email: contractor.email,
        phone: contractor.phone,
        registrationId: contractor.id,
      })

      toast({ title: t('partner.pool.toast_success') })
      setIsPoolModalOpen(false)
      setSelectedContractorId('')
    }
  }

  const handleAddQuoteItem = () => {
    if (!quoteDesc || quoteAmount <= 0) return
    setQuoteItems([
      ...quoteItems,
      {
        id: Math.random().toString(),
        description: quoteDesc,
        amount: quoteAmount,
      },
    ])
    setQuoteDesc('')
    setQuoteAmount(0)
  }

  const handleRemoveQuoteItem = (id: string) => {
    setQuoteItems(quoteItems.filter((i) => i.id !== id))
  }

  const handleSubmitQuote = () => {
    if (!selectedProjectForQuote || quoteItems.length === 0) return
    const totalAmount = quoteItems.reduce((acc, i) => acc + i.amount, 0)

    // Simplification: assign to the partner's assigned stage
    const project = projects.find((p) => p.id === selectedProjectForQuote)
    const partnerInfo = project?.partners.find((p) => p.id === partnerId)
    const stageId = partnerInfo?.stageId || project?.stages[0]?.id || ''

    addQuote(selectedProjectForQuote, {
      partnerId: partnerId,
      stageId,
      items: quoteItems,
      totalAmount,
    })

    toast({
      title: t('partner.quote_modal.toast_success'),
      description: t('partner.quote_modal.toast_desc'),
    })
    setIsQuoteOpen(false)
    setQuoteItems([])
    setSelectedProjectForQuote('')
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('partner.dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('partner.dashboard.subtitle')}
            {activePartner?.companyName || user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-lg py-1 px-3 bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Star className="w-4 h-4 mr-1 fill-current" />
            {t('partner.dashboard.score')}{' '}
            {activePartner?.performanceScore || 0}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partner.dashboard.active_projects')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partner.dashboard.allocated_team')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePartner?.team.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('partner.dashboard.expected_receivables')}
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(activePartner?.agreedPrice || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 py-1.5 scrollbar-none">
          <TabsTrigger value="projects" className="whitespace-nowrap">
            {t('partner.tabs.projects')}
          </TabsTrigger>
          <TabsTrigger value="quotes" className="whitespace-nowrap">
            {t('partner.tabs.quotes')}
          </TabsTrigger>
          <TabsTrigger value="team" className="whitespace-nowrap">
            {t('partner.tabs.team')}
          </TabsTrigger>
          <TabsTrigger value="vendors" className="whitespace-nowrap">
            {t('partner.tabs.vendors')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6 mt-4">
          {partnerProjects.map((proj) => (
            <Card key={proj.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{proj.name}</CardTitle>
                    <CardDescription>{proj.location}</CardDescription>
                  </div>
                  <Badge>{proj.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 bg-muted/30 p-3 rounded-lg border text-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <p className="font-semibold text-primary mb-1">
                      {t('partner.projects.assigned_tasks')}
                    </p>
                    <p className="text-muted-foreground">
                      {t('partner.projects.tasks_desc')}
                    </p>
                  </div>
                </div>
                <ProjectScheduleTable
                  projectId={proj.id}
                  stages={proj.stages}
                  partners={proj.partners}
                  isPartnerView={true}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>{t('partner.quotes.title')}</CardTitle>
                <CardDescription>{t('partner.quotes.desc')}</CardDescription>
              </div>
              <Button onClick={() => setIsQuoteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> {t('partner.quotes.send_btn')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerProjects.flatMap((p) =>
                  p.quotes
                    .filter((q) => q.partnerId === partnerId)
                    .map((q) => ({ ...q, projectName: p.name })),
                ).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                    {t('partner.quotes.empty')}
                  </div>
                ) : (
                  partnerProjects
                    .flatMap((p) =>
                      p.quotes
                        .filter((q) => q.partnerId === partnerId)
                        .map((q) => ({ ...q, projectName: p.name })),
                    )
                    .map((quote) => (
                      <div
                        key={quote.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {t('partner.quotes.quote_for')} {quote.projectName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {quote.items.length} {t('partner.quotes.items')} •{' '}
                            {t('partner.quotes.sent_on')}{' '}
                            {formatDate
                              ? formatDate(
                                  new Date(quote.createdAt),
                                  'dd/MM/yyyy',
                                )
                              : new Date(quote.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg">
                            {formatCurrency(quote.totalAmount)}
                          </span>
                          <Badge
                            variant={
                              quote.status === 'approved'
                                ? 'default'
                                : quote.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className={
                              quote.status === 'approved' ? 'bg-green-500' : ''
                            }
                          >
                            {quote.status === 'pending' &&
                              t('partner.quotes.status.pending')}
                            {quote.status === 'approved' &&
                              t('partner.quotes.status.approved')}
                            {quote.status === 'rejected' &&
                              t('partner.quotes.status.rejected')}
                          </Badge>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <VendorsTabContent />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={() => setIsPoolModalOpen(true)}>
              <UserCheck className="mr-2 h-4 w-4" />{' '}
              {t('partner.team.search_pool')}
            </Button>
            <Button onClick={() => setIsTeamModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('partner.team.new_member')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('partner.team.members_title')}</CardTitle>
              <CardDescription>
                {t('partner.team.members_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePartner?.team.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  {t('partner.team.empty')}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activePartner?.team.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold">{member.name}</span>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <span className="text-xs uppercase font-semibold">
                            {t('partner.team.email')}
                          </span>{' '}
                          {member.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-xs uppercase font-semibold">
                            {t('partner.team.phone')}
                          </span>{' '}
                          {member.phone}
                        </p>
                        <p className="text-xs mt-2 bg-muted p-1 rounded w-fit">
                          {t('partner.team.id')} {member.registrationId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Add Modal */}
      {activePartner && partnerProjects.length > 0 && (
        <TeamMemberModal
          open={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          partnerId={activePartner.id}
          projectId={partnerProjects[0].id}
        />
      )}

      {/* Pool Selection Modal */}
      <Dialog open={isPoolModalOpen} onOpenChange={setIsPoolModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('partner.pool.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>{t('partner.pool.label')}</Label>
            <Select onValueChange={setSelectedContractorId}>
              <SelectTrigger>
                <SelectValue placeholder={t('partner.pool.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {availableContractors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('partner.pool.desc')}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddFromPool}
              disabled={!selectedContractorId}
            >
              {t('partner.pool.add_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Quote Dialog */}
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('partner.quote_modal.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('partner.quote_modal.project_label')}</Label>
              <Select
                value={selectedProjectForQuote}
                onValueChange={setSelectedProjectForQuote}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('partner.quote_modal.project_placeholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {partnerProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md p-4 space-y-4 bg-muted/20">
              <Label>{t('partner.quote_modal.items_label')}</Label>
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 space-y-2 w-full">
                  <Input
                    placeholder={t('partner.quote_modal.desc_placeholder')}
                    value={quoteDesc}
                    onChange={(e) => setQuoteDesc(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <CurrencyInput
                    value={quoteAmount}
                    onChange={setQuoteAmount}
                  />
                </div>
                <Button
                  onClick={handleAddQuoteItem}
                  variant="secondary"
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {t('partner.quote_modal.add_btn')}
                </Button>
              </div>

              {quoteItems.length > 0 && (
                <ul className="space-y-2 pt-2 border-t">
                  {quoteItems.map((it) => (
                    <li
                      key={it.id}
                      className="flex justify-between items-center text-sm bg-background p-2 rounded border"
                    >
                      <span>{it.description}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          {formatCurrency(it.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemoveQuoteItem(it.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-right pt-2 font-bold text-lg">
                {t('partner.quote_modal.total')}{' '}
                {formatCurrency(quoteItems.reduce((a, b) => a + b.amount, 0))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitQuote}
              disabled={!selectedProjectForQuote || quoteItems.length === 0}
            >
              {t('partner.quote_modal.submit_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
