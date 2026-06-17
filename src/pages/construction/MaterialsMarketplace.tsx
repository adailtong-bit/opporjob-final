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
  const [purchaseMaterial, setPurchaseMaterial] = useState<Material | null>(
    null,
  )
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
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

    // Fallback to any random active campaign
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

  const openPurchaseDialog = (material: Material) => {
    setPurchaseQuantity(1)
    setPurchaseMaterial(material)
  }

  const submitPurchase = async () => {
    if (!purchaseMaterial || !user) return
    setPurchaseLoading(true)
    try {
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          requester_id: user.id,
          status: 'pending',
          total_amount: (purchaseMaterial.price || 0) * purchaseQuantity,
        })
        .select()
        .single()

      if (poError) throw poError

      await supabase.from('purchase_order_items').insert({
        purchase_order_id: po.id,
        material_id: purchaseMaterial.id,
        material_name: purchaseMaterial.name,
        quantity: purchaseQuantity,
        unit_price: purchaseMaterial.price || 0,
        total_price: (purchaseMaterial.price || 0) * purchaseQuantity,
      })

      toast({
        title: 'Pedido Efetuado',
        description: `Adicionado ${purchaseQuantity} un. de ${
          purchaseMaterial.name
        } ao pedido #${po.id.slice(0, 8)}.`,
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao processar o pedido de compra.',
        variant: 'destructive',
      })
    } finally {
      setPurchaseLoading(false)
      setPurchaseMaterial(null)
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/construction/dashboard')}
        className="-mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('back')}
      </Button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('market.list.title')}
          </h1>
          <p className="text-muted-foreground">{t('market.list.desc')}</p>
        </div>
        {isAdmin && (
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Novo Material
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm">
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

      <div className="border rounded-lg bg-card overflow-x-auto">
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
                        onClick={() => openPurchaseDialog(material)}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        {t('market.buy_now')}
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

      <Dialog
        open={!!purchaseMaterial}
        onOpenChange={(open) => !open && setPurchaseMaterial(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar ao Pedido de Compra</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p>
              Item:{' '}
              <span className="font-medium">{purchaseMaterial?.name}</span>
            </p>
            <p>
              Preço Unitário:{' '}
              <span className="font-medium">
                {purchaseMaterial?.price
                  ? formatCurrency(purchaseMaterial.price)
                  : 'N/A'}
              </span>
            </p>

            <div className="space-y-2">
              <Label>Quantidade a Comprar</Label>
              <Input
                type="number"
                min="1"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
              />
            </div>
            <div className="text-right text-lg">
              Total Estimado:{' '}
              <span className="font-bold text-primary">
                {purchaseMaterial?.price
                  ? formatCurrency(purchaseMaterial.price * purchaseQuantity)
                  : 'N/A'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseMaterial(null)}>
              {t('cancel')}
            </Button>
            <Button disabled={purchaseLoading} onClick={submitPurchase}>
              {purchaseLoading ? 'Processando...' : 'Adicionar ao Pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
