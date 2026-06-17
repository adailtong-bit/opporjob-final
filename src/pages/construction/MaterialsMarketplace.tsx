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
} from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

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

export default function MaterialsMarketplace() {
  const { t, formatCurrency } = useLanguageStore()
  const [materials, setMaterials] = useState<Material[]>([])
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

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
        return t('market.category.electrical')
      case 'Hidráulica':
        return t('market.category.hydraulic')
      case 'Alvenaria':
        return t('market.category.masonry')
      case 'Pintura':
        return t('market.category.painting')
      case 'Ferramentas':
        return t('market.category.tools')
      default:
        return cat || 'Geral'
    }
  }

  const uniqueCategories = Array.from(
    new Set(materials.map((m) => m.category).filter(Boolean)),
  ) as string[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('market.list.title')}
          </h1>
          <p className="text-muted-foreground">{t('market.list.desc')}</p>
        </div>
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
        <Table className="min-w-[600px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('market.column.material')}</TableHead>
              <TableHead>{t('market.column.category')}</TableHead>
              <TableHead className="text-right">
                {t('market.column.estimate')}
              </TableHead>
              <TableHead className="w-[300px]">
                {t('market.column.whereToBuy')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('loading')}
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
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
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                      {material.price ? formatCurrency(material.price) : 'N/A'}{' '}
                      {material.unit && `/ ${material.unit}`}
                    </TableCell>
                    <TableCell>
                      {ad ? (
                        <div className="flex items-center justify-between gap-3 p-2 rounded-lg border bg-background/50 hover:bg-background transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {ad.media_url ? (
                              <div className="w-8 h-8 rounded bg-white border flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm">
                                <img
                                  src={ad.media_url}
                                  alt={ad.advertiser?.name || ad.title}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0 shadow-sm">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                              <span
                                className="text-xs font-medium truncate"
                                title={ad.advertiser?.name || ad.title}
                              >
                                {ad.advertiser?.name || ad.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                {t('market.sponsored')}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs px-3 shrink-0 shadow-sm"
                            asChild
                          >
                            <a
                              href={ad.target_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t('market.buy_now')}{' '}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic flex items-center h-full px-2">
                          {t('market.no_partners')}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
