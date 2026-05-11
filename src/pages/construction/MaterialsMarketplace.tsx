import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMaterialStore, Material } from '@/stores/useMaterialStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart,
  Search,
  ArrowLeft,
  ExternalLink,
  Upload,
  Lock,
  Trash2,
  Store,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface CartItem {
  id: string
  material: Material
  quantity: number
  unitPrice: number
  brand?: string
  color?: string
}

export default function MaterialsMarketplace() {
  const [searchParams] = useSearchParams()
  const urlProjectId = searchParams.get('projectId')
  const urlStageId = searchParams.get('stageId')

  const navigate = useNavigate()
  const { materials, vendors, addOrder, importMaterialList, addVendor } =
    useMaterialStore()
  const { projects, addAllocatedCost, updateStageActuals } = useProjectStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { t, formatCurrency } = useLanguageStore()

  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Configure Item State
  const [configuringMaterial, setConfiguringMaterial] =
    useState<Material | null>(null)
  const [configBrand, setConfigBrand] = useState('')
  const [configColor, setConfigColor] = useState('')
  const [configQuantity, setConfigQuantity] = useState(1)

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutProjectId, setCheckoutProjectId] = useState<string>(
    urlProjectId || '',
  )
  const [checkoutStageId, setCheckoutStageId] = useState<string>(
    urlStageId || 'none',
  )
  const [checkoutVendorId, setCheckoutVendorId] = useState<string>('')

  // New Vendor State
  const [isNewVendorOpen, setIsNewVendorOpen] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')

  // Custom Material State
  const [isCustomMaterialOpen, setIsCustomMaterialOpen] = useState(false)
  const [customMaterial, setCustomMaterial] = useState({
    name: '',
    price: 0,
    unit: 'un',
    quantity: 1,
    category: 'Diversos',
  })

  useEffect(() => {
    if (urlProjectId) setCheckoutProjectId(urlProjectId)
    if (urlStageId) setCheckoutStageId(urlStageId)
  }, [urlProjectId, urlStageId])

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || m.category === categoryFilter
    const matchesVendor = vendorFilter === 'all' || m.supplier === vendorFilter
    return matchesSearch && matchesCategory && matchesVendor
  })

  const canPurchase = (material: Material) => {
    if (!material.purchasePermissions) return true
    if (!user) return false
    if (user.role === 'admin' || user.teamRole === 'Admin') return true
    return material.purchasePermissions.includes(user.teamRole || '')
  }

  const openConfigModal = (material: Material) => {
    if (!canPurchase(material)) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: 'Permission denied',
      })
      return
    }
    setConfiguringMaterial(material)
    setConfigBrand('')
    setConfigColor('')
    setConfigQuantity(1)
  }

  const confirmAddToCart = () => {
    if (!configuringMaterial || configQuantity <= 0) return

    setCart((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2),
        material: configuringMaterial,
        quantity: configQuantity,
        unitPrice: configuringMaterial.price,
        brand: configBrand.trim(),
        color: configColor.trim(),
      },
    ])
    toast({ title: 'Added to cart' })
    setConfiguringMaterial(null)
  }

  const updateCartItem = (
    id: string,
    field: 'quantity' | 'unitPrice',
    value: number,
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return {
              ...item,
              [field]: field === 'quantity' ? Math.max(0, value) : value,
            }
          }
          return item
        })
        .filter((i) => i.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  )

  const handleAddNewVendor = () => {
    if (!newVendorName.trim()) return
    const v = addVendor({ name: newVendorName })
    setCheckoutVendorId(v.id)
    setIsNewVendorOpen(false)
    setNewVendorName('')
    toast({ title: 'Vendor registered successfully!' })
  }

  const handleAddCustomMaterial = () => {
    if (
      !customMaterial.name ||
      customMaterial.price <= 0 ||
      customMaterial.quantity <= 0
    )
      return

    const newMat: Material = {
      id: 'custom-' + Math.random().toString(36).substr(2, 9),
      name: customMaterial.name,
      category: customMaterial.category,
      price: customMaterial.price,
      unit: customMaterial.unit,
      imageUrl: 'https://img.usecurling.com/p/300/300?q=box&color=gray',
      supplier: checkoutVendorId
        ? vendors.find((v) => v.id === checkoutVendorId)?.name ||
          'Fornecedor Local'
        : 'Avulso',
      stock: 999,
      description: 'Item adicionado sob demanda para a obra',
    }

    setCart((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2),
        material: newMat,
        quantity: customMaterial.quantity,
        unitPrice: customMaterial.price,
        brand: 'Sob Demanda',
        color: '',
      },
    ])

    toast({ title: 'Item avulso adicionado ao carrinho!' })
    setIsCustomMaterialOpen(false)
    setCustomMaterial({
      name: '',
      price: 0,
      unit: 'un',
      quantity: 1,
      category: 'Diversos',
    })
  }

  const handleCheckoutSubmit = () => {
    if (!checkoutProjectId) {
      toast({
        variant: 'destructive',
        title: 'Allocation Required',
        description: 'Select the destination project for this purchase.',
      })
      return
    }
    if (!checkoutVendorId) {
      toast({
        variant: 'destructive',
        title: 'Vendor Required',
        description: 'Select or register the vendor/store.',
      })
      return
    }

    const selectedVendor = vendors.find((v) => v.id === checkoutVendorId)
    const selectedProject = projects.find((p) => p.id === checkoutProjectId)

    const orderItems = cart.map((item) => ({
      material: item.material,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
      brand: item.brand,
      color: item.color,
    }))

    // Always force pending_approval as per User Story
    addOrder({
      projectId: checkoutProjectId,
      stageId: checkoutStageId !== 'none' ? checkoutStageId : undefined,
      vendorId: checkoutVendorId,
      vendorName: selectedVendor?.name,
      items: orderItems,
      total: cartTotal,
      status: 'pending_approval',
      requesterId: user?.id,
      requesterName: user?.name,
    })

    // Integrar com o painel financeiro da obra
    addAllocatedCost(checkoutProjectId, {
      description: `Pedido de Materiais: ${selectedVendor?.name || 'Diversos'}`,
      amount: cartTotal,
      type: 'actual',
      category: 'material',
      costClass: 'capex',
      date: new Date(),
      stageId: checkoutStageId !== 'none' ? checkoutStageId : undefined,
    })

    if (checkoutStageId !== 'none') {
      updateStageActuals(
        checkoutProjectId,
        checkoutStageId,
        'material',
        cartTotal,
      )
    }

    toast({
      title: 'Pedido Registrado',
      description: `A compra de ${formatCurrency(cartTotal)} foi enviada e integrada ao financeiro da obra.`,
    })

    setCart([])
    setIsCheckoutOpen(false)
    navigate(`/construction/projects/${checkoutProjectId}?tab=purchasing`)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const result = await importMaterialList(e.target.files[0])
      if (result.success) {
        toast({
          title: t('success') || 'Success',
          description: `${result.count} items imported.`,
        })
      }
    }
  }

  const selectedProjectStages =
    projects.find((p) => p.id === checkoutProjectId)?.stages || []

  const isCartValid = cart.length > 0 && cart.every((i) => i.quantity > 0)
  const isAllocationValid = !!checkoutProjectId

  const activeProjects = projects.filter((p) => p.status === 'in_progress')

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {urlProjectId && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Materials & Purchases
            </h1>
            <p className="text-muted-foreground">
              Search for products, specify variations and allocate costs to
              projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden md:block">
            <p className="text-sm text-muted-foreground">Cart Value</p>
            <p className="font-bold text-lg text-primary">
              {formatCurrency(cartTotal)}
            </p>
          </div>
          <Button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="relative bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Checkout
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, brand or code..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Estrutura">Structure</SelectItem>
            <SelectItem value="Alvenaria">Masonry</SelectItem>
            <SelectItem value="Acabamento">Finishing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Default Vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {[...new Set(materials.map((m) => m.supplier))].map((sup) => (
              <SelectItem key={sup} value={sup}>
                {sup}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setIsCustomMaterialOpen(true)}
          title="Adicionar item fora do catálogo"
          className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
        >
          <Plus className="mr-2 h-4 w-4" /> Item Avulso
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          title="Import product list"
          className="hidden sm:flex"
        >
          <Upload className="mr-2 h-4 w-4" /> Importar
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
          accept=".csv,.xlsx"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMaterials.map((material) => {
          const allowed = canPurchase(material)
          const totalInCart = cart
            .filter((i) => i.material.id === material.id)
            .reduce((acc, item) => acc + item.quantity, 0)

          return (
            <Card
              key={material.id}
              className={`flex flex-col overflow-hidden hover:shadow-md transition-shadow ${!allowed ? 'opacity-70 grayscale-[30%]' : ''}`}
            >
              <div className="aspect-[4/3] relative bg-muted group">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 shadow-sm">
                  {material.category === 'Estrutura'
                    ? 'Structure'
                    : material.category === 'Alvenaria'
                      ? 'Masonry'
                      : material.category === 'Acabamento'
                        ? 'Finishing'
                        : material.category}
                </Badge>
                {!allowed && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <Badge variant="destructive" className="flex gap-1">
                      <Lock className="h-3 w-3" /> Locked (Permission)
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base leading-tight line-clamp-2 min-h-[2.5rem]">
                  {material.name}
                </CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Store className="h-3 w-3" /> {material.supplier}
                  </p>
                  {material.supplierWebsite && (
                    <a
                      href={material.supplierWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Site <ExternalLink className="h-2 w-2" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(material.price)}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {material.unit}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 bg-muted/20 border-t mt-2 flex-col gap-2">
                <Button
                  className="w-full mt-2"
                  onClick={() => openConfigModal(material)}
                  disabled={!allowed}
                  variant={totalInCart > 0 ? 'outline' : 'secondary'}
                >
                  {totalInCart > 0
                    ? `Add More (${totalInCart} in cart)`
                    : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Item Configuration Dialog */}
      <Dialog
        open={!!configuringMaterial}
        onOpenChange={(open) => !open && setConfiguringMaterial(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Specifications</DialogTitle>
            <DialogDescription>
              Define details, brand, and variations for{' '}
              {configuringMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Brand</Label>
                <Input
                  placeholder="Ex: Tigre, Votorantim..."
                  value={configBrand}
                  onChange={(e) => setConfigBrand(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Color/Variation</Label>
                <Input
                  placeholder="Ex: White, Gray..."
                  value={configColor}
                  onChange={(e) => setConfigColor(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Quantity ({configuringMaterial?.unit})</Label>
              <Input
                type="number"
                min="1"
                value={configQuantity}
                onChange={(e) =>
                  setConfigQuantity(parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div className="bg-muted p-3 rounded-md text-right mt-2 border">
              <p className="text-sm text-muted-foreground">
                Estimated Subtotal
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(
                  (configuringMaterial?.price || 0) * configQuantity,
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfiguringMaterial(null)}
            >
              Cancel
            </Button>
            <Button onClick={confirmAddToCart} disabled={configQuantity <= 0}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Checkout</DialogTitle>
            <DialogDescription>
              Review the amounts, units, and allocate for financial approval.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Allocation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  Destination Project <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={checkoutProjectId}
                  onValueChange={setCheckoutProjectId}
                >
                  <SelectTrigger
                    className={`bg-background ${!checkoutProjectId ? 'border-red-300' : ''}`}
                  >
                    <SelectValue placeholder="Select destination project" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!checkoutProjectId && (
                  <p className="text-xs text-red-500">
                    Project selection is required for budget control.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Schedule Stage (Optional)
                </Label>
                <Select
                  value={checkoutStageId}
                  onValueChange={setCheckoutStageId}
                  disabled={!checkoutProjectId}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="General (No specific stage)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      General (No specific stage)
                    </SelectItem>
                    {selectedProjectStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendor Section */}
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    Loja / Fornecedor <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={checkoutVendorId}
                    onValueChange={setCheckoutVendorId}
                  >
                    <SelectTrigger className="bg-background border-blue-200">
                      <SelectValue placeholder="Onde você está comprando?" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsNewVendorOpen(!isNewVendorOpen)}
                  className="bg-background border-blue-200 hover:bg-blue-100"
                >
                  <Store className="mr-2 h-4 w-4 text-blue-600" /> Nova Loja
                </Button>
              </div>

              {/* Inline New Vendor Form */}
              {isNewVendorOpen && (
                <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                  <Input
                    placeholder="New Vendor Name..."
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="bg-background"
                    autoFocus
                  />
                  <Button
                    onClick={handleAddNewVendor}
                    disabled={!newVendorName.trim()}
                  >
                    Save Vendor
                  </Button>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[40%]">Specified Product</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="w-[120px]">Qty / Unit</TableHead>
                    <TableHead className="text-right">Item Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.material.name}
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                          {item.brand && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4"
                            >
                              Brand: {item.brand}
                            </Badge>
                          )}
                          {item.color && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4"
                            >
                              Color: {item.color}
                            </Badge>
                          )}
                          {checkoutProjectId && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 text-primary border-primary/30"
                            >
                              Project:{' '}
                              {
                                projects.find((p) => p.id === checkoutProjectId)
                                  ?.name
                              }
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">
                            $
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="h-8 w-24 text-right"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateCartItem(
                                item.id,
                                'unitPrice',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            className="h-8 w-16 text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItem(
                                item.id,
                                'quantity',
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {item.material.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row items-center justify-between border-t pt-4 gap-4">
            <div className="text-left w-full sm:w-auto">
              <p className="text-sm text-muted-foreground">Order Total</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(cartTotal)}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckoutSubmit}
                disabled={!isCartValid || !isAllocationValid}
                className="w-full sm:w-auto"
              >
                Request Approval
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Custom Material Dialog */}
      <Dialog
        open={isCustomMaterialOpen}
        onOpenChange={setIsCustomMaterialOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item Fora do Catálogo</DialogTitle>
            <DialogDescription>
              Adicione materiais avulsos que você vai comprar diretamente na
              loja para esta obra.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome do Produto</Label>
              <Input
                placeholder="Ex: Cimento, Prego, Tubo PVC..."
                value={customMaterial.name}
                onChange={(e) =>
                  setCustomMaterial({ ...customMaterial, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Preço Unitário</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    value={customMaterial.price}
                    onChange={(e) =>
                      setCustomMaterial({
                        ...customMaterial,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={customMaterial.quantity}
                  onChange={(e) =>
                    setCustomMaterial({
                      ...customMaterial,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Unidade de Medida</Label>
                <Input
                  placeholder="Ex: un, kg, m³..."
                  value={customMaterial.unit}
                  onChange={(e) =>
                    setCustomMaterial({
                      ...customMaterial,
                      unit: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={customMaterial.category}
                  onValueChange={(val) =>
                    setCustomMaterial({ ...customMaterial, category: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estrutura">Estrutura</SelectItem>
                    <SelectItem value="Alvenaria">Alvenaria</SelectItem>
                    <SelectItem value="Acabamento">Acabamento</SelectItem>
                    <SelectItem value="Diversos">Diversos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomMaterialOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCustomMaterial}
              disabled={!customMaterial.name || customMaterial.price <= 0}
            >
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
