import { useState, useRef } from 'react'
import { useProjectStore, ComplianceDocument } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck,
  Plus,
  Trash2,
  Upload,
  AlertTriangle,
  Settings,
  FileText,
  History,
  RefreshCw,
  Download,
} from 'lucide-react'

interface ProjectComplianceProps {
  projectId: string
}

const typeLabels: Record<string, string> = {
  permit: 'Permissão / Alvará',
  city_hall: 'Doc. Prefeitura',
  contractor_contract: 'Contrato de Execução',
  constructor_insurance: 'Seguro Construtor',
  owner_insurance: 'Seguro Proprietário',
  technical: 'Técnico',
  other: 'Outros',
}

export function ProjectCompliance({ projectId }: ProjectComplianceProps) {
  const {
    getProject,
    addComplianceDocument,
    deleteComplianceDocument,
    updateAlertLeadTime,
    renewComplianceDocument,
  } = useProjectStore()
  const { formatDate } = useLanguageStore()
  const { toast } = useToast()

  const project = getProject(projectId)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [leadTime, setLeadTime] = useState(project?.alertLeadTimeDays || 30)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const [newDoc, setNewDoc] = useState<Partial<ComplianceDocument>>({
    name: '',
    description: '',
    type: 'permit',
    partnerId: 'general',
    isCritical: false,
    provider: '',
  })

  // Renew state
  const fileInputRenewRef = useRef<HTMLInputElement>(null)
  const [isRenewOpen, setIsRenewOpen] = useState(false)
  const [docToRenew, setDocToRenew] = useState<ComplianceDocument | null>(null)
  const [renewFile, setRenewFile] = useState<File | null>(null)
  const [renewData, setRenewData] = useState({
    expirationDate: '',
    issueDate: '',
  })

  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [docHistory, setDocHistory] = useState<ComplianceDocument | null>(null)

  if (!project) return null

  const docs = project.complianceDocuments || []
  const partners = project.partners || []

  const getDocStatusInfo = (expirationDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exp = new Date(expirationDate)
    exp.setHours(0, 0, 0, 0)
    const diffTime = exp.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0)
      return {
        status: 'expired',
        label: 'Vencido',
        badgeClass: 'destructive',
        icon: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
      }
    if (diffDays <= 30)
      return {
        status: 'warning',
        label: diffDays === 0 ? 'Vence Hoje' : `Vence em ${diffDays} dias`,
        badgeClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />,
      }
    return {
      status: 'active',
      label: 'Ativo',
      badgeClass: 'bg-green-500 hover:bg-green-600 text-white',
      icon: <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />,
    }
  }

  const handleAddDoc = () => {
    if (!newDoc.name || !newDoc.expirationDate || !newDoc.type) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
        description: 'Título, Categoria e Data de Validade são necessários.',
      })
      return
    }

    addComplianceDocument(projectId, {
      name: newDoc.name,
      description: newDoc.description,
      type: newDoc.type as any,
      provider: newDoc.provider,
      partnerId: newDoc.partnerId,
      expirationDate: new Date(newDoc.expirationDate),
      issueDate: newDoc.issueDate ? new Date(newDoc.issueDate) : undefined,
      url: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      isCritical: newDoc.isCritical || false,
    })

    setIsAddOpen(false)
    setNewDoc({
      name: '',
      description: '',
      type: 'permit',
      partnerId: 'general',
      isCritical: false,
      provider: '',
    })
    setSelectedFile(null)
    toast({ title: 'Documento registrado com sucesso!' })
  }

  const handleSaveSettings = () => {
    updateAlertLeadTime(projectId, leadTime)
    setIsSettingsOpen(false)
    toast({ title: 'Configurações de alerta atualizadas' })
  }

  const handleRenewClick = (doc: ComplianceDocument) => {
    setDocToRenew(doc)
    setRenewData({
      expirationDate: '',
      issueDate: '',
    })
    setRenewFile(null)
    setIsRenewOpen(true)
  }

  const handleRenewSubmit = () => {
    if (!docToRenew || !renewData.expirationDate) {
      toast({
        variant: 'destructive',
        title: 'A nova data de validade é obrigatória.',
      })
      return
    }

    renewComplianceDocument(projectId, docToRenew.id, {
      expirationDate: new Date(renewData.expirationDate),
      issueDate: renewData.issueDate
        ? new Date(renewData.issueDate)
        : undefined,
      url: renewFile ? URL.createObjectURL(renewFile) : docToRenew.url,
    })

    setIsRenewOpen(false)
    setRenewFile(null)
    toast({
      title: 'Documento Renovado',
      description: 'A nova versão foi ativada e a anterior foi arquivada.',
    })
  }

  const handleViewHistory = (doc: ComplianceDocument) => {
    setDocHistory(doc)
    setIsHistoryOpen(true)
  }

  const filteredDocs = docs.filter((doc) => {
    if (filterCategory === 'all') return true
    if (filterCategory === 'permits')
      return doc.type === 'permit' || doc.type === 'city_hall'
    if (filterCategory === 'contracts')
      return doc.type === 'contractor_contract'
    if (filterCategory === 'constructor_insurance')
      return doc.type === 'constructor_insurance'
    if (filterCategory === 'owner_insurance')
      return doc.type === 'owner_insurance'
    if (filterCategory === 'others')
      return doc.type === 'technical' || doc.type === 'other'
    return true
  })

  const summary = docs.reduce(
    (acc, doc) => {
      const status = getDocStatusInfo(doc.expirationDate).status
      if (status === 'expired') acc.expired++
      else if (status === 'warning') acc.warning++
      else acc.active++
      return acc
    },
    { active: 0, warning: 0, expired: 0 },
  )

  return (
    <div className="space-y-6 min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-green-800 font-medium">
              Documentos Ativos
            </p>
            <p className="text-2xl font-bold text-green-900">
              {summary.active}
            </p>
          </div>
          <ShieldCheck className="h-8 w-8 text-green-500 opacity-50" />
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-800 font-medium">
              Vencendo em breve (30 dias)
            </p>
            <p className="text-2xl font-bold text-yellow-900">
              {summary.warning}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-red-800 font-medium">Vencidos</p>
            <p className="text-2xl font-bold text-red-900">{summary.expired}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-start pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Compliance &
              Permissões
            </CardTitle>
            <CardDescription>
              Gerencie documentos críticos e previna paralisações por
              documentação vencida.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Configurações de Alerta"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações de Compliance</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Aviso de Vencimento (Dias de antecedência)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={leadTime}
                      onChange={(e) => setLeadTime(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Documentos com vencimento inferior a este prazo serão
                      marcados como alerta.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveSettings}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registro de Documento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>
                      Título do Documento{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Ex: Alvará de Construção, Contrato Estrutural"
                      value={newDoc.name}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>
                        Categoria <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newDoc.type}
                        onValueChange={(val) =>
                          setNewDoc({ ...newDoc, type: val as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permit">
                            Permissões / Alvarás
                          </SelectItem>
                          <SelectItem value="city_hall">
                            Doc. Prefeitura
                          </SelectItem>
                          <SelectItem value="contractor_contract">
                            Contrato de Execução
                          </SelectItem>
                          <SelectItem value="constructor_insurance">
                            Seguro Construtor
                          </SelectItem>
                          <SelectItem value="owner_insurance">
                            Seguro Proprietário
                          </SelectItem>
                          <SelectItem value="technical">Técnico</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Vincular a (Parceiro / Geral)</Label>
                      <Select
                        value={newDoc.partnerId}
                        onValueChange={(val) =>
                          setNewDoc({ ...newDoc, partnerId: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            Geral (Projeto)
                          </SelectItem>
                          {partners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Detalhes adicionais do documento..."
                      value={newDoc.description || ''}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Empresa / Entidade Emissora</Label>
                      <Input
                        placeholder="Ex: Prefeitura de SP, Seguradora X"
                        value={newDoc.provider || ''}
                        onChange={(e) =>
                          setNewDoc({ ...newDoc, provider: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>
                        Data de Validade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={
                          newDoc.expirationDate
                            ? (newDoc.expirationDate as unknown as string)
                            : ''
                        }
                        onChange={(e) =>
                          setNewDoc({
                            ...newDoc,
                            expirationDate: e.target.value as any,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20 mt-2">
                    <Checkbox
                      id="critical"
                      checked={newDoc.isCritical}
                      onCheckedChange={(c) =>
                        setNewDoc({ ...newDoc, isCritical: !!c })
                      }
                    />
                    <label
                      htmlFor="critical"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Documento Crítico (Impede a execução da obra se vencido)
                    </label>
                  </div>
                  <div
                    className="border-2 border-dashed p-6 rounded-md text-center cursor-pointer hover:bg-muted/50 mt-2"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                        fileInputRef.current.click()
                      }
                    }}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {selectedFile
                        ? selectedFile.name
                        : 'Clique ou arraste o arquivo digital (PDF/Imagem)'}
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddDoc}>Salvar Registro</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Renew Dialog */}
            <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renovar Documento</DialogTitle>
                  <CardDescription>
                    O documento atual será arquivado no histórico de versões.
                  </CardDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nova Data de Emissão (Opcional)</Label>
                    <Input
                      type="date"
                      value={renewData.issueDate}
                      onChange={(e) =>
                        setRenewData({
                          ...renewData,
                          issueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nova Data de Validade</Label>
                    <Input
                      type="date"
                      value={renewData.expirationDate}
                      onChange={(e) =>
                        setRenewData({
                          ...renewData,
                          expirationDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    className="border-2 border-dashed p-4 rounded-md text-center cursor-pointer hover:bg-muted/50 mt-2"
                    onClick={() => {
                      if (fileInputRenewRef.current) {
                        fileInputRenewRef.current.value = ''
                        fileInputRenewRef.current.click()
                      }
                    }}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {renewFile
                        ? renewFile.name
                        : 'Anexar novo arquivo PDF/Imagem'}
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRenewRef}
                      onChange={(e) =>
                        setRenewFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRenewSubmit}>
                    Confirmar Renovação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Histórico de Versões</DialogTitle>
                  <CardDescription>{docHistory?.name}</CardDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto mt-2">
                  {docHistory?.history && docHistory.history.length > 0 ? (
                    <div className="relative border-l-2 border-muted ml-3 pl-4 space-y-4">
                      {docHistory.history.map((h, i) => (
                        <div key={h.id} className="relative">
                          <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                          <p className="text-sm font-medium">
                            Versão Arquivada {docHistory.history!.length - i}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <p>
                              <strong>Vencimento:</strong>{' '}
                              {formatDate(h.expirationDate, 'dd/MM/yyyy')}
                            </p>
                            {h.issueDate && (
                              <p>
                                <strong>Emissão:</strong>{' '}
                                {formatDate(h.issueDate, 'dd/MM/yyyy')}
                              </p>
                            )}
                            <p>
                              <strong>Arquivado em:</strong>{' '}
                              {formatDate(h.uploadedAt, 'dd/MM/yyyy HH:mm')}
                            </p>
                            {h.url && (
                              <a
                                href={h.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline mt-1 inline-flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" /> Ver Arquivo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 border rounded bg-muted/10 text-sm">
                      Nenhum histórico arquivado.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            className="w-full mt-4 min-w-0"
            onValueChange={setFilterCategory}
          >
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="mb-4 flex flex-nowrap h-auto justify-start w-max min-w-full">
                <TabsTrigger value="all" className="whitespace-nowrap">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="permits" className="whitespace-nowrap">
                  Licenças / Prefeitura
                </TabsTrigger>
                <TabsTrigger value="contracts" className="whitespace-nowrap">
                  Contratos
                </TabsTrigger>
                <TabsTrigger
                  value="constructor_insurance"
                  className="whitespace-nowrap"
                >
                  Seguros (Construtor)
                </TabsTrigger>
                <TabsTrigger
                  value="owner_insurance"
                  className="whitespace-nowrap"
                >
                  Seguros (Proprietário)
                </TabsTrigger>
                <TabsTrigger value="others" className="whitespace-nowrap">
                  Técnico / Outros
                </TabsTrigger>
              </TabsList>
            </div>

            {filteredDocs.length > 0 ? (
              <div className="rounded-md border overflow-x-auto w-full block">
                <Table className="min-w-[800px] w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Documento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Vínculo / Emissor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Anexo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc) => {
                      const statusInfo = getDocStatusInfo(doc.expirationDate)
                      const partner = partners.find(
                        (p) => p.id === doc.partnerId,
                      )
                      const linkName =
                        doc.partnerId === 'general'
                          ? 'Geral'
                          : partner?.companyName || 'Desconhecido'

                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              {statusInfo.icon}
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-medium">{doc.name}</p>
                                  {doc.isCritical && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] text-red-600 border-red-200 bg-red-50"
                                    >
                                      Crítico
                                    </Badge>
                                  )}
                                </div>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-normal text-xs"
                            >
                              {typeLabels[doc.type] || doc.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{linkName}</span>
                              {doc.provider && (
                                <span className="text-xs text-muted-foreground">
                                  {doc.provider}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {formatDate(doc.expirationDate, 'dd/MM/yyyy')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                statusInfo.badgeClass as
                                  | 'default'
                                  | 'destructive'
                                  | 'secondary'
                                  | 'outline'
                              }
                              className={
                                statusInfo.badgeClass.includes('bg-')
                                  ? statusInfo.badgeClass
                                  : ''
                              }
                            >
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {doc.url ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Baixar / Visualizar Anexo"
                              >
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download className="h-4 w-4 text-blue-500" />
                                </a>
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground px-2 italic">
                                Sem anexo
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Renovar Documento"
                              onClick={() => handleRenewClick(doc)}
                            >
                              <RefreshCw className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Ver Histórico"
                              onClick={() => handleViewHistory(doc)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                deleteComplianceDocument(projectId, doc.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/10 my-4">
                <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum documento registrado nesta categoria
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Registre alvarás, seguros, contratos e outras documentações
                  para monitorar os prazos de validade e manter a obra regular.
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Documento
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
