import { useState } from 'react'
import { useMaterialStore, Order } from '@/stores/useMaterialStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { CheckCircle2, XCircle, Clock, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ApprovalDashboard() {
  const { orders, updateOrderStatus } = useMaterialStore()
  const { projects, addAllocatedCost, updateStageActuals } = useProjectStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { formatCurrency, formatDate } = useLanguageStore()

  const isManager = user?.role === 'project_manager' || user?.role === 'admin'
  const isFinance =
    user?.role === 'accountant' ||
    user?.role === 'admin' ||
    user?.role === 'finance'

  const pendingOrders = orders.filter((o) => {
    if (o.status === 'pending_manager' && isManager) return true
    if (o.status === 'pending_finance' && isFinance) return true
    return false
  })

  const actionedOrders = orders
    .filter(
      (o) =>
        o.status === 'ordered' ||
        o.status === 'rejected' ||
        o.status === 'delivered',
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleAction = (order: Order, action: 'approved' | 'rejected') => {
    if (!user) return

    let nextStatus: Order['status'] = 'rejected'
    if (action === 'approved') {
      nextStatus =
        order.status === 'pending_manager' ? 'pending_finance' : 'ordered'
    }

    updateOrderStatus(order.id, nextStatus, user.name)

    if (nextStatus === 'ordered') {
      addAllocatedCost(order.projectId, {
        description: `Compra: ${order.vendorName} (${order.items.length} itens)`,
        amount: order.total,
        type: 'actual',
        category: 'material',
        costClass: 'capex',
        date: new Date(),
        stageId: order.stageId,
      })

      if (order.stageId) {
        updateStageActuals(
          order.projectId,
          order.stageId,
          'material',
          order.total,
        )
      }

      toast({
        title: 'Pedido Aprovado pelo Financeiro',
        description:
          'O custo foi alocado ao projeto e o pedido enviado ao fornecedor.',
      })
    } else if (nextStatus === 'pending_finance') {
      toast({
        title: 'Aprovado pelo Gerente',
        description: 'Enviado para aprovação financeira.',
      })
    } else {
      toast({ title: 'Pedido Rejeitado', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Centro de Aprovações
        </h1>
        <p className="text-muted-foreground">
          Gerencie e valide as solicitações de compra antes de impactar o
          orçamento.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingOrders.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Histórico de Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/10">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500/50 mb-3" />
              <p className="text-lg font-medium">Tudo limpo!</p>
              <p className="text-muted-foreground">
                Não há solicitações de compra pendentes.
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Solicit.</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Especificações (Itens)</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => {
                      const project = projects.find(
                        (p) => p.id === order.projectId,
                      )
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(order.date, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {project?.name || 'Obra Não Encontrada'}
                          </TableCell>
                          <TableCell>{order.vendorName}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              {order.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex flex-wrap gap-1 items-center"
                                >
                                  <span className="font-semibold">
                                    {item.quantity}x {item.material.name}
                                  </span>
                                  {(item.brand || item.color) && (
                                    <span className="text-muted-foreground">
                                      ({item.brand} {item.color})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.requesterName || 'Usuário'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {formatCurrency(order.total)}
                            <div className="text-[10px] text-muted-foreground mt-1 uppercase">
                              {order.status === 'pending_manager'
                                ? 'Aprovação Gerente'
                                : 'Aprovação Finanças'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAction(order, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />{' '}
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(order, 'rejected')}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Ação</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum histórico de validação encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    actionedOrders.map((order) => {
                      const project = projects.find(
                        (p) => p.id === order.projectId,
                      )
                      const actionDate =
                        order.status === 'rejected'
                          ? order.rejectedAt
                          : order.financeApprovedAt || order.managerApprovedAt
                      const actionUser =
                        order.status === 'rejected'
                          ? order.rejectedBy
                          : order.financeName || order.managerName

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {actionDate
                              ? formatDate(
                                  new Date(actionDate),
                                  'dd/MM/yyyy HH:mm',
                                )
                              : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {project?.name || 'Obra Não Encontrada'}
                          </TableCell>
                          <TableCell>{order.vendorName}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell>
                            {order.status === 'ordered' ||
                            order.status === 'delivered' ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Aprovado / Solicitado
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Rejeitado</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {actionUser || 'Sistema'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
