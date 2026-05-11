import { useState, useEffect, useMemo } from 'react'
import { useVendorStore, Vendor } from '@/stores/useVendorStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Store,
  ShoppingCart,
  Edit2,
  Trash2,
  PackageOpen,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/stores/useLanguageStore'
// @ts-expect-error
import { useMaterialStore } from '@/stores/useMaterialStore'

export function VendorsTabContent() {
  const { vendors, fetchVendors, addVendor, updateVendor, deleteVendor } =
    useVendorStore()
  const { toast } = useToast()
  const { formatCurrency, formatDate } = useLanguageStore()

  // Try to safely access orders from material store if it exists
  const materialOrders = useMaterialStore((state: any) => state.orders || [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
  })

  const [viewHistoryVendor, setViewHistoryVendor] = useState<Vendor | null>(
    null,
  )

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    if (editingVendor) {
      await updateVendor(editingVendor.id, formData)
      toast({ title: 'Fornecedor atualizado' })
    } else {
      await addVendor(formData)
      toast({ title: 'Fornecedor cadastrado' })
    }
    setIsModalOpen(false)
    setFormData({ name: '', email: '', phone: '', category: '' })
    setEditingVendor(null)
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      email: vendor.email || '',
      phone: vendor.phone || '',
      category: vendor.category || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      await deleteVendor(id)
      toast({ title: 'Fornecedor removido' })
    }
  }

  const openHistory = (vendor: Vendor) => {
    setViewHistoryVendor(vendor)
  }

  const vendorOrders = useMemo(() => {
    if (!viewHistoryVendor) return []
    return materialOrders.filter(
      (o: any) =>
        o.vendorName === viewHistoryVendor.name ||
        o.vendorId === viewHistoryVendor.id,
    )
  }, [viewHistoryVendor, materialOrders])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Gestão de Fornecedores
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Cadastre parceiros e acompanhe o histórico de compras e custos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingVendor(null)
            setFormData({ name: '', email: '', phone: '', category: '' })
            setIsModalOpen(true)
          }}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Store className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground mb-1">
              Nenhum fornecedor cadastrado
            </p>
            <p className="text-sm mb-4">
              Adicione lojas e distribuidores para vincular às suas compras.
            </p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Cadastrar Primeiro Fornecedor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="flex flex-col group hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative">
                <div className="pr-12">
                  <CardTitle
                    className="text-base leading-tight"
                    title={vendor.name}
                  >
                    {vendor.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal"
                    >
                      {vendor.category || 'Geral'}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-1 absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 hover:bg-muted"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive bg-background/80 hover:bg-destructive/10"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-4">
                <div className="text-sm space-y-1.5 mb-4 bg-muted/30 p-3 rounded-lg">
                  <p className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">
                      Email
                    </span>{' '}
                    <span
                      className="font-medium truncate ml-2"
                      title={vendor.email || ''}
                    >
                      {vendor.email || '-'}
                    </span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">
                      Tel
                    </span>{' '}
                    <span className="font-medium">{vendor.phone || '-'}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700 border-blue-100 transition-colors"
                  onClick={() => openHistory(vendor)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" /> Histórico de Compras
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Nome da Empresa / Loja{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Casa do Construtor"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Ex: Elétrica"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contato@empresa.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Fornecedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog
        open={!!viewHistoryVendor}
        onOpenChange={(open) => !open && setViewHistoryVendor(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              Histórico - {viewHistoryVendor?.name}
            </DialogTitle>
            <CardDescription>
              Visualização centralizada de todas as compras realizadas com este
              fornecedor.
            </CardDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
            {vendorOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed flex flex-col items-center">
                <PackageOpen className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-medium text-foreground">
                  Sem registro de compras
                </p>
                <p className="text-sm">
                  Nenhum pedido efetuado com este fornecedor ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorOrders.map((order: any) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden border-muted shadow-sm"
                  >
                    <div className="bg-muted/30 p-3 px-4 border-b flex justify-between items-center text-sm">
                      <div className="font-semibold text-primary flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Pedido #{order.id?.substring(0, 6).toUpperCase()}
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-muted-foreground text-xs font-medium">
                          {formatDate && order.date
                            ? formatDate(order.date, 'dd/MM/yyyy')
                            : order.date}
                        </span>
                        {order.projectId && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 text-[10px]"
                          >
                            Vinculado à Obra
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2.5">
                        {order.items?.map((item: any, idx: number) => (
                          <li
                            key={idx}
                            className="flex justify-between items-start text-sm group"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="bg-muted/50 p-1.5 rounded mt-0.5">
                                <PackageOpen className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  {item.material?.name || item.name}
                                </span>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {item.quantity}{' '}
                                  {item.material?.unit || item.unit || 'un'} x{' '}
                                  {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                            </div>
                            <span className="font-semibold tabular-nums mt-1">
                              {formatCurrency(
                                item.total || item.quantity * item.unitPrice,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          Valor Total do Pedido
                        </span>
                        <span className="font-bold text-lg text-primary tabular-nums">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
