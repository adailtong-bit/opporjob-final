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
  const { formatCurrency, formatDate } = useLanguageStore()

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

      toast({ title: 'Profissional adicionado à equipe' })
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
      title: 'Orçamento enviado!',
      description: 'O contratante irá avaliar a sua proposta.',
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
            Painel do Parceiro
          </h1>
          <p className="text-muted-foreground">
            Gestão de Obras, Orçamentos e Equipes |{' '}
            {activePartner?.companyName || user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-lg py-1 px-3 bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Star className="w-4 h-4 mr-1 fill-current" />
            Score: {activePartner?.performanceScore || 0}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
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
              Equipe Alocada
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
              Recebíveis Previstos
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
            Meus Projetos & Tarefas
          </TabsTrigger>
          <TabsTrigger value="quotes" className="whitespace-nowrap">
            Orçamentos (Propostas)
          </TabsTrigger>
          <TabsTrigger value="team" className="whitespace-nowrap">
            Minha Equipe
          </TabsTrigger>
          <TabsTrigger value="vendors" className="whitespace-nowrap">
            Fornecedores
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
                      Suas Atividades Atribuídas:
                    </p>
                    <p className="text-muted-foreground">
                      Use as opções da tarefa para solicitar medições ao
                      contratante.
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
                <CardTitle>Meus Orçamentos</CardTitle>
                <CardDescription>
                  Envie novas propostas e acompanhe as aprovações.
                </CardDescription>
              </div>
              <Button onClick={() => setIsQuoteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Enviar Proposta
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
                    Nenhuma proposta enviada.
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
                            Orçamento para {quote.projectName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {quote.items.length} itens • Enviado em{' '}
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
                            {quote.status === 'pending' && 'Em Análise'}
                            {quote.status === 'approved' && 'Aprovado'}
                            {quote.status === 'rejected' && 'Rejeitado'}
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
              <UserCheck className="mr-2 h-4 w-4" /> Buscar no Banco de Talentos
            </Button>
            <Button onClick={() => setIsTeamModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Membro
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Profissionais vinculados à sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePartner?.team.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Nenhum membro registrado. Adicione manualmente ou busque no
                  banco de talentos.
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
                            Email:
                          </span>{' '}
                          {member.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-xs uppercase font-semibold">
                            Tel:
                          </span>{' '}
                          {member.phone}
                        </p>
                        <p className="text-xs mt-2 bg-muted p-1 rounded w-fit">
                          ID: {member.registrationId}
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
            <DialogTitle>Selecionar do Banco de Talentos</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>Profissionais Disponíveis</Label>
            <Select onValueChange={setSelectedContractorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional..." />
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
              Adicionando este profissional à sua equipe permanente.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddFromPool}
              disabled={!selectedContractorId}
            >
              Adicionar à Equipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Quote Dialog */}
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Enviar Nova Proposta / Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Para qual projeto?</Label>
              <Select
                value={selectedProjectForQuote}
                onValueChange={setSelectedProjectForQuote}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
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
              <Label>Itens do Orçamento</Label>
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 space-y-2 w-full">
                  <Input
                    placeholder="Descrição do serviço/material"
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
                  Adicionar
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
                Total:{' '}
                {formatCurrency(quoteItems.reduce((a, b) => a + b.amount, 0))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitQuote}
              disabled={!selectedProjectForQuote || quoteItems.length === 0}
            >
              Enviar Orçamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
