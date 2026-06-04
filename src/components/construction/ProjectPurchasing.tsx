import { useMaterialStore } from '@/stores/useMaterialStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ShoppingCart, Store, PackageOpen, FileText } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function ProjectPurchasing({ projectId }: { projectId: string }) {
  const { getOrdersByProject } = useMaterialStore()
  const { formatCurrency, formatDate } = useLanguageStore()

  const orders = getOrdersByProject(projectId)
  const [dbInvoices, setDbInvoices] = useState<any[]>([])

  useEffect(() => {
    supabase.from('invoices').select('*, vendors(name)').eq('project_id', projectId).then(({ data }) => {
      if (data) setDbInvoices(data)
    })
  }, [projectId])

  const formatInvoiceCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6 min-w-0 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-xl border shadow-sm gap-6 mb-6">
        <div className="space-y-1.5 flex-1 pr-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" /> Histórico de
            Compras
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Acompanhe os pedidos de materiais alocados exclusivamente para esta
            obra. Inicie novos pedidos selecionando materiais do catálogo.
          </p>
        </div>
        <div className="w-full md:w-auto shrink-0 flex items-center">
          <Button
            asChild
            size="lg"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all"
          >
            <Link to={`/construction/materials?projectId=${projectId}`}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Nova Compra
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table className="min-w-[800px] w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Itens Detalhados</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">
                  Status / Financeiro
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((order) => (
                    <TableRow key={order.id} className="group">
                      <TableCell className="text-sm text-muted-foreground align-top pt-4">
                        {formatDate(order.date, 'dd/MM/yyyy')}
                        <div className="text-[10px] mt-1">
                          Ref: #{order.id.substring(0, 5).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <div className="font-medium flex items-center gap-1.5">
                          <Store className="h-4 w-4 text-blue-500" />
                          {order.vendorName || 'Diversos'}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        <ul className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm flex items-start gap-2 bg-muted/20 p-1.5 rounded"
                            >
                              <PackageOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span className="font-medium">
                                  {item.material.name}
                                </span>
                                <div className="text-xs text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {item.quantity} {item.material.unit} x{' '}
                                      {formatCurrency(item.unitPrice)}
                                    </span>
                                    <span className="font-semibold text-foreground">
                                      {formatCurrency(item.total)}
                                    </span>
                                  </div>
                                  {(item.brand || item.color) && (
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                      {item.brand && (
                                        <span>Marca: {item.brand}</span>
                                      )}
                                      {item.color && (
                                        <span>Cor: {item.color}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-right align-top pt-4 text-base">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-center align-top pt-4">
                        <div className="flex flex-col items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                          >
                            Pedido Confirmado
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            Lançado no CAPEX
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : null}

              {dbInvoices.length > 0 && dbInvoices.map((inv) => (
                <TableRow key={inv.id} className="group bg-blue-50/30">
                  <TableCell className="text-sm text-muted-foreground align-top pt-4">
                    {formatDate(inv.created_at, 'dd/MM/yyyy')}
                    <div className="text-[10px] mt-1">
                      Inv: #{inv.id.substring(0, 5).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="align-top pt-4">
                    <div className="font-medium flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-blue-500" />
                      {inv.vendors?.name || 'Fornecedor'}
                    </div>
                  </TableCell>
                  <TableCell className="align-top pt-4">
                    <ul className="space-y-1.5">
                      <li className="text-sm flex items-start gap-2 bg-muted/20 p-1.5 rounded">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-medium">{inv.description}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Fatura importada (DB)
                          </div>
                        </div>
                      </li>
                    </ul>
                  </TableCell>
                  <TableCell className="font-bold text-primary text-right align-top pt-4 text-base whitespace-nowrap">
                    {formatInvoiceCurrency(inv.amount, inv.currency)}
                  </TableCell>
                  <TableCell className="text-center align-top pt-4">
                    <div className="flex flex-col items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && dbInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p>Nenhuma compra registrada para este projeto.</p>
                      <Button
                        variant="link"
                        asChild
                        className="text-primary mt-2"
                      >
                        <Link
                          to={`/construction/materials?projectId=${projectId}`}
                        >
                          Ir para o Marketplace
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
