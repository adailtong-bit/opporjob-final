import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Ruler,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProjectApprovalWorkflowProps {
  projectId: string
}

export function ProjectApprovalWorkflow({
  projectId,
}: ProjectApprovalWorkflowProps) {
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([])
  const {
    getProject,
    updateApprovalStatus,
    approveMeasurement,
    updateMeasurementStatus,
    approveLedgerEntry,
    updateLedgerEntry,
  } = useProjectStore()
  const { t, formatDate, formatCurrency } = useLanguageStore()
  const { toast } = useToast()
  const project = getProject(projectId)

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*, vendors(name)')
        .eq('project_id', projectId)
        .in('status', ['pending', 'overdue'])
      if (data) setPendingInvoices(data)
    }
    fetchInvoices()
  }, [projectId])

  if (!project) return null

  const handleStatusChange = (id: string, status: any) => {
    updateApprovalStatus(projectId, id, status, t('proj.approvals.manager'))
    toast({
      title: t('success'),
      description: `${t('status')} ${t('proj.approvals.' + status)}`,
    })
  }

  const handleMeasurementAction = (
    id: string,
    action: 'approve' | 'reject' | 'in_review',
  ) => {
    if (action === 'approve') {
      approveMeasurement(projectId, id)
      toast({
        title: 'Medição Aprovada',
        description: 'Fatura gerada e progresso atualizado.',
      })
    } else {
      updateMeasurementStatus(
        projectId,
        id,
        action === 'reject' ? 'rejected' : 'in_review',
      )
      toast({
        title: 'Status Atualizado',
        description: `Medição movida para ${action === 'reject' ? 'Rejeitado' : 'Em Revisão'}.`,
      })
    }
  }

  const handleLedgerAction = (
    id: string,
    action: 'approve' | 'reject' | 'in_review',
  ) => {
    if (action === 'approve') {
      approveLedgerEntry(projectId, id)
      toast({
        title: 'Serviço Aprovado',
        description: 'Execução do serviço confirmada com sucesso.',
      })
    } else {
      updateLedgerEntry(projectId, id, {
        executionStatus: action === 'reject' ? 'rejected' : 'in_review',
      })
      toast({
        title: 'Status Atualizado',
        description: `Serviço movido para ${action === 'reject' ? 'Rejeitado' : 'Em Revisão'}.`,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t('proj.approvals.approved')}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">{t('proj.approvals.rejected')}</Badge>
        )
      case 'in_review':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            {t('proj.approvals.in_review')}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{t('proj.approvals.pending')}</Badge>
    }
  }

  const getPartnerCompliance = (partnerId: string) => {
    const docs = project.complianceDocuments || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return docs.filter(
      (d) =>
        (d.partnerId === partnerId || d.partnerId === 'general') &&
        d.isCritical &&
        new Date(d.expirationDate) < today,
    )
  }

  const pendingMeasurements =
    project.measurements?.filter(
      (m) => m.status === 'pending' || m.status === 'in_review',
    ) || []

  const handleInvoiceAction = async (
    id: string,
    action: 'approve' | 'reject',
  ) => {
    const newStatus = action === 'approve' ? 'paid' : 'cancelled'
    await supabase.from('invoices').update({ status: newStatus }).eq('id', id)
    setPendingInvoices((prev) => prev.filter((inv) => inv.id !== id))
    toast({
      title: action === 'approve' ? 'Fatura Aprovada' : 'Fatura Rejeitada',
      description:
        action === 'approve'
          ? 'A fatura foi marcada como paga.'
          : 'A fatura foi cancelada.',
    })
  }

  const pendingLedgers =
    project.ledgerEntries?.filter(
      (l) =>
        l.executionStatus === 'pending' || l.executionStatus === 'in_review',
    ) || []

  return (
    <div className="space-y-6 min-w-0">
      {pendingInvoices.length > 0 && (
        <Card className="w-full border-orange-200 shadow-sm">
          <CardHeader className="bg-orange-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <FileText className="h-5 w-5" /> Aprovação de Faturas (Invoices)
            </CardTitle>
            <CardDescription>
              Valide e aprove faturas pendentes de fornecedores.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-x-auto w-full block">
              <Table className="min-w-[800px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">
                        {inv.description || 'Fatura de Serviço'}
                      </TableCell>
                      <TableCell>
                        {inv.vendors?.name || 'Desconhecido'}
                      </TableCell>
                      <TableCell>
                        {inv.due_date
                          ? formatDate(inv.due_date, 'dd/MM/yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-orange-700">
                        {formatCurrency(inv.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            inv.status === 'overdue'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="uppercase"
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleInvoiceAction(inv.id, 'approve')
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleInvoiceAction(inv.id, 'reject')
                            }
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingLedgers.length > 0 && (
        <Card className="w-full border-purple-200 shadow-sm">
          <CardHeader className="bg-purple-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <CheckCircle2 className="h-5 w-5" /> Aprovação de Serviços e
              Fornecedores (Ledger)
            </CardTitle>
            <CardDescription>
              Valide a execução de serviços. O sistema bloqueia a aprovação caso
              o parceiro tenha documentação vencida.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-x-auto w-full block">
              <Table className="min-w-[800px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço / Origem</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Custo Final</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLedgers.map((l) => {
                    const partnerName =
                      project.partners?.find((p) => p.id === l.partnerId)
                        ?.companyName || 'N/A'
                    const expiredDocs = getPartnerCompliance(l.partnerId)
                    const isBlocked = expiredDocs.length > 0

                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <span className="font-medium">{l.description}</span>
                          <span className="text-xs text-muted-foreground block">
                            {l.origin}
                          </span>
                        </TableCell>
                        <TableCell>{partnerName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(l.finalCost)}
                        </TableCell>
                        <TableCell className="text-center">
                          {isBlocked ? (
                            <Badge variant="destructive">
                              Bloqueado ({expiredDocs.length})
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Regular
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(l.executionStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            {isBlocked ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-block cursor-not-allowed">
                                      <Button
                                        size="sm"
                                        disabled
                                        className="pointer-events-none opacity-50"
                                      >
                                        <CheckCircle2 className="mr-1 h-4 w-4" />{' '}
                                        Aprovar
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-red-50 text-red-900 border-red-200">
                                    Docs Vencidos:{' '}
                                    {expiredDocs.map((d) => d.name).join(', ')}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleLedgerAction(l.id, 'approve')
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" />{' '}
                                Aprovar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleLedgerAction(l.id, 'in_review')
                              }
                              title="Em Revisão"
                            >
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLedgerAction(l.id, 'reject')}
                              title="Rejeitar"
                              className="hover:bg-red-50 hover:text-red-600 border-red-200 text-red-500"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingMeasurements.length > 0 && (
        <Card className="w-full border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Ruler className="h-5 w-5" /> Aprovação de Medições (Parceiros)
            </CardTitle>
            <CardDescription>
              Valide o percentual executado para liberar faturamento automático.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-x-auto w-full block">
              <Table className="min-w-[900px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Tarefa / Fase</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead className="text-right">
                      Progresso Solicitado
                    </TableHead>
                    <TableHead className="text-right">
                      Valor a Liberar
                    </TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingMeasurements.map((m) => {
                    const partner = project.partners?.find(
                      (p) => p.id === m.partnerId,
                    )
                    const stageName =
                      project.stages.find((s) => s.id === m.stageId)?.name || ''
                    const subName =
                      project.stages
                        .find((s) => s.id === m.stageId)
                        ?.subStages.find((sub) => sub.id === m.subStageId)
                        ?.name || ''
                    const expiredDocs = getPartnerCompliance(
                      m.partnerId || 'general',
                    )
                    const isBlocked = expiredDocs.length > 0

                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          {formatDate(m.date, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{subName}</span>
                          <span className="text-xs text-muted-foreground block">
                            {stageName}
                          </span>
                        </TableCell>
                        <TableCell>{partner?.companyName}</TableCell>
                        <TableCell className="text-right font-bold">
                          {m.requestedPercentage}%
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(m.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {isBlocked ? (
                            <Badge variant="destructive">
                              Bloqueado ({expiredDocs.length})
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Regular
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(m.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            {isBlocked ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-block cursor-not-allowed">
                                      <Button
                                        size="sm"
                                        disabled
                                        className="pointer-events-none opacity-50"
                                      >
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-red-50 text-red-900 border-red-200">
                                    Docs Vencidos:{' '}
                                    {expiredDocs.map((d) => d.name).join(', ')}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleMeasurementAction(m.id, 'approve')
                                }
                                className="bg-green-600 hover:bg-green-700"
                                title="Aprovar Medição"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleMeasurementAction(m.id, 'in_review')
                              }
                              title="Em Revisão"
                            >
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleMeasurementAction(m.id, 'reject')
                              }
                              title="Rejeitar"
                              className="hover:bg-red-50 hover:text-red-600 border-red-200 text-red-500"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('proj.approvals.title')}</CardTitle>
          <CardDescription>{t('proj.approvals.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto w-full block">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('proj.approvals.type')}</TableHead>
                  <TableHead>{t('proj.approvals.description')}</TableHead>
                  <TableHead>{t('proj.approvals.date')}</TableHead>
                  <TableHead className="text-center">
                    {t('proj.approvals.status')}
                  </TableHead>
                  <TableHead>{t('proj.approvals.history')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.approvalLogs && project.approvalLogs.length > 0 ? (
                  project.approvalLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="capitalize flex items-center gap-2">
                        {log.type === 'invoice' ? (
                          <FileText className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                        {log.type}
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>
                        {formatDate(log.date, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {log.history.length} {t('proj.approvals.changes')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(log.id, 'approved')
                              }
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              {t('proj.approvals.approved')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(log.id, 'in_review')
                              }
                            >
                              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                              {t('proj.approvals.in_review')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(log.id, 'rejected')
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              {t('proj.approvals.rejected')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('proj.approvals.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
