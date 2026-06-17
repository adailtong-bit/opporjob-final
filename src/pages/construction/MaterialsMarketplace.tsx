import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Search,
  Zap,
  Droplets,
  PaintRoller,
  Hammer,
  BrickWall,
  Package,
  ExternalLink,
  ShoppingCart,
  ArrowLeft,
  Plus,
  X,
  Minus,
  Info,
} from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface Material {
  id: string
  name: string
  category: string | null
  price: number | null
  unit: string | null
  stock: number | null
}

interface AdCampaign {
  id: string
  title: string
  media_url: string | null
  target_url: string | null
  specifications: Record<string, any> | null
  advertiser: {
    name: string
  } | null
}

interface CartItem {
  material: Material
  quantity: number
  unitPrice: number
}

const materialSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório'),
  category: z.string().min(2, 'A categoria é obrigatória'),
  price: z.coerce.number().min(0, 'O preço deve ser positivo'),
  unit: z.string().min(1, 'A unidade é obrigatória'),
  stock: z.coerce.number().int().min(0, 'O estoque deve ser positivo'),
})

type MaterialFormValues = z.infer<typeof materialSchema>

export default function MaterialsMarketplace() {
  const { t, formatCurrency } = useLanguageStore()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { user: domainUser } = useAuthStore()
  const { toast } = useToast()

  const [materials, setMaterials] = useState<Material[]>([])
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [allCategories, setAllCategories] = useState<string[]>([])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  const isAdmin = domainUser?.isPremium || domainUser?.role === 'admin'

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      unit: 'un',
      stock: 0,
    },
  })

  useEffect(() => {
    fetchData()
    fetchCategoriesList()
  }, [])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .select('id, name')
      .eq('owner_id', user.id)

    if (data) {
      setProjects(data)
      const params = new URLSearchParams(window.location.search)
      const pId = params.get('projectId')
      if (pId && data.some((p) => p.id === pId)) {
        setSelectedProjectId(pId)
      } else if (data.length > 0) {
        setSelectedProjectId(data[0].id)
      }
    }
  }

  const fetchCategoriesList = async () => {
    const { data } = await supabase
      .from('subcategories')
      .select(`name, categories!inner(type)`)
      .eq('categories.type', 'marketplace')

    if (data) {
      setAllCategories(data.map((c: any) => c.name))
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const [materialsRes, campaignsRes] = await Promise.all([
      supabase.from('materials').select('*').order('name'),
      supabase
        .from('advertising_campaigns')
        .select(
          `
          id, title, media_url, target_url, specifications,
          vendors(name)
        `,
        )
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString()),
    ])

    if (materialsRes.data) {
      setMaterials(materialsRes.data)
    }

    if (campaignsRes.data) {
      const mappedCampaigns = campaignsRes.data.map((c) => ({
        ...c,
        advertiser: Array.isArray(c.vendors) ? c.vendors[0] : c.vendors,
      }))
      setCampaigns(mappedCampaigns as any)
    }

    setLoading(false)
  }

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || m.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getAdForCategory = (category: string | null) => {
    if (!category) return null
    const specificAd = campaigns.find(
      (c) => c.specifications?.category === category,
    )
    if (specificAd) return specificAd

    return campaigns.length > 0
      ? campaigns[Math.floor(Math.random() * campaigns.length)]
      : null
  }

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case 'Elétrica':
      case 'Electrical':
        return <Zap className="h-4 w-4 text-yellow-500" />
      case 'Hidráulica':
      case 'Hydraulic':
        return <Droplets className="h-4 w-4 text-blue-500" />
      case 'Pintura':
      case 'Painting':
        return <PaintRoller className="h-4 w-4 text-purple-500" />
      case 'Ferramentas':
      case 'Tools':
        return <Hammer className="h-4 w-4 text-gray-500" />
      case 'Alvenaria':
      case 'Masonry':
        return <BrickWall className="h-4 w-4 text-orange-500" />
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getCategoryTranslation = (cat: string | null) => {
    switch (cat) {
      case 'Elétrica':
        return t('market.category.electrical') || cat
      case 'Hidráulica':
        return t('market.category.hydraulic') || cat
      case 'Alvenaria':
        return t('market.category.masonry') || cat
      case 'Pintura':
        return t('market.category.painting') || cat
      case 'Ferramentas':
        return t('market.category.tools') || cat
      default:
        return cat || 'Geral'
    }
  }

  const uniqueCategories = Array.from(
    new Set(materials.map((m) => m.category).filter(Boolean)),
  ) as string[]

  const combinedCategories = Array.from(
    new Set([...allCategories, ...uniqueCategories]),
  )

  const openAddModal = () => {
    form.reset()
    setIsAddModalOpen(true)
  }

  const onAddSubmit = async (values: MaterialFormValues) => {
    try {
      const { error } = await supabase.from('materials').insert({
        name: values.name,
        category: values.category,
        price: values.price,
        unit: values.unit,
        stock: values.stock,
      })
      if (error) throw error
      toast({
        title: 'Sucesso',
        description: 'Material adicionado ao catálogo.',
      })
      setIsAddModalOpen(false)
      fetchData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o material.',
        variant: 'destructive',
      })
    }
  }

  const addToCart = (material: Material) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.material.id === material.id)
      if (existing) {
        return prev.map((item) =>
          item.material.id === material.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [
        ...prev,
        { material, quantity: 1, unitPrice: material.price || 0 },
      ]
    })
    toast({
      title: 'Adicionado',
      description: `${material.name} foi adicionado ao carrinho.`,
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.material.id === id) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }),
    )
  }

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.material.id !== id))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  )

  const handleCheckout = async () => {
    if (!selectedProjectId) {
      toast({
        title: 'Erro',
        description: 'Selecione um projeto para continuar.',
        variant: 'destructive',
      })
      return
    }
    if (cart.length === 0 || !user) return

    setPurchaseLoading(true)
    try {
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          requester_id: user.id,
          project_id: selectedProjectId,
          status: 'pending_manager',
          total_amount: cartTotal,
        })
        .select()
        .single()

      if (poError) throw poError

      const itemsToInsert = cart.map((item) => ({
        purchase_order_id: po.id,
        material_id: item.material.id,
        material_name: item.material.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
      }))

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsToInsert)
      if (itemsError) throw itemsError

      toast({
        title: 'Pedido Finalizado',
        description: 'Seu pedido foi registrado para o projeto selecionado.',
        action: (
          <ToastAction
            altText="Ver Projeto"
            onClick={() =>
              navigate(`/construction/projects/${selectedProjectId}`)
            }
          >
            Ver Projeto
          </ToastAction>
        ),
      })
      setCart([])
      setIsCartOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Falha ao processar o pedido de compra.',
        variant: 'destructive',
      })
    } finally {
      setPurchaseLoading(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur-md py-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 -mx-4 px-4 md:-mx-8 md:px-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/construction/dashboard')}
              className="-ml-3 h-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {t('back')}
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-none">
            {t('market.list.title')}
          </h1>
        </div>
        <div className="flex flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          {isAdmin && (
            <Button
              onClick={openAddModal}
              variant="outline"
              className="flex-1 md:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" /> Material
            </Button>
          )}
          <Button
            className="relative flex-1 md:flex-none shadow-md hover:shadow-lg transition-all duration-300"
            size="lg"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ver Carrinho
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-6 min-w-[24px] px-1.5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm animate-in zoom-in">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm mx-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('general.search')}
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-background">
            <SelectValue placeholder={t('market.column.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('market.all_categories')}</SelectItem>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryTranslation(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-card overflow-x-auto shadow-sm">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('market.column.material')}</TableHead>
              <TableHead>{t('market.column.category')}</TableHead>
              <TableHead className="text-right">
                {t('market.column.estimate')}
              </TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="w-[250px]">
                {t('market.column.whereToBuy')}
              </TableHead>
              <TableHead className="w-[120px] text-right">
                {t('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('market.empty')}
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => {
                const ad = getAdForCategory(material.category)
                return (
                  <TableRow
                    key={material.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <TableCell>
                      <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                        {getCategoryIcon(material.category)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {material.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-normal whitespace-nowrap shadow-sm"
                      >
                        {getCategoryTranslation(material.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {material.price ? formatCurrency(material.price) : 'N/A'}{' '}
                      {material.unit && `/ ${material.unit}`}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                      {material.stock || 0} {material.unit}
                    </TableCell>
                    <TableCell>
                      {ad ? (
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg border bg-background/50 hover:bg-background transition-colors">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {ad.media_url ? (
                              <div className="w-7 h-7 rounded bg-white border flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm">
                                <img
                                  src={ad.media_url}
                                  alt={ad.advertiser?.name || ad.title}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0 shadow-sm">
                                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                              <span
                                className="text-xs font-medium truncate"
                                title={ad.advertiser?.name || ad.title}
                              >
                                {ad.advertiser?.name || ad.title}
                              </span>
                              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                {t('market.sponsored')}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 shrink-0"
                            asChild
                          >
                            <a
                              href={ad.target_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic flex items-center h-full">
                          {t('market.no_partners')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 shadow-sm"
                        onClick={() => addToCart(material)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Adicionar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Material</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAddSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Material</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cimento Portland..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('market.category')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {combinedCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {getCategoryTranslation(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário Estimado</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade de Medida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: un, saco, m²" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Disponível</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit">Salvar Material</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col bg-card border-l p-0 shadow-2xl z-[100]">
          <SheetHeader className="p-6 border-b bg-muted/30">
            <SheetTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Carrinho de Compras
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map((item) => (
              <div
                key={item.material.id}
                className="flex gap-4 p-4 border bg-background rounded-xl shadow-sm relative group transition-colors hover:border-primary/30"
              >
                <div className="h-20 w-20 rounded-md bg-muted border overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={`https://img.usecurling.com/p/100/100?q=${encodeURIComponent(item.material.category || 'building material')}`}
                    alt={item.material.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 justify-between py-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-sm leading-tight text-foreground/90">
                        {item.material.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Est. {formatCurrency(item.unitPrice)} /{' '}
                        {item.material.unit || 'un'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive -mt-1 -mr-2"
                      onClick={() => removeCartItem(item.material.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg h-8 bg-muted/50">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-full w-8 rounded-none rounded-l-lg hover:bg-background"
                        onClick={() => updateQuantity(item.material.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-10 text-center text-xs font-semibold bg-background h-full flex items-center justify-center border-x">
                        {item.quantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-full w-8 rounded-none rounded-r-lg hover:bg-background"
                        onClick={() => updateQuantity(item.material.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right text-sm font-bold text-primary">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Carrinho Vazio
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">
                  Adicione materiais do catálogo para iniciar um pedido de
                  compra.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setIsCartOpen(false)}
                >
                  Explorar Materiais
                </Button>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t bg-muted/20 space-y-5">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs flex items-start gap-3 shadow-inner">
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <p className="leading-relaxed">
                  <strong>Fluxo Multi-Projetos:</strong> Você pode comprar para
                  um projeto por vez. Para alocar em múltiplos projetos,
                  finalize este pedido e inicie um novo em seguida.
                </p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center justify-between">
                  Projeto de Destino
                  {projects.length === 0 && (
                    <span className="text-xs font-normal text-destructive">
                      Nenhum projeto ativo
                    </span>
                  )}
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                  disabled={projects.length === 0}
                >
                  <SelectTrigger className="w-full bg-background h-11 border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        className="cursor-pointer"
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-border/50">
                <span className="text-foreground/80">Total Estimado</span>
                <span className="text-primary text-xl">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <Button
                className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all"
                size="lg"
                disabled={
                  purchaseLoading || cart.length === 0 || !selectedProjectId
                }
                onClick={handleCheckout}
              >
                {purchaseLoading
                  ? 'Processando...'
                  : 'Finalizar Pedido de Compra'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
