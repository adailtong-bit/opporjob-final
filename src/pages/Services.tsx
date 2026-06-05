import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, SearchX, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/components/home/ServiceCard'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useJobStore } from '@/stores/useJobStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Services() {
  const { t } = useLanguageStore()
  const { categories } = useCategoryStore()
  const { jobs, incrementImpressions } = useJobStore()
  const [searchParams] = useSearchParams()
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const categoryParam = searchParams.get('category')
  const [activeFilter, setActiveFilter] = useState(categoryParam || 'all')

  useEffect(() => {
    if (categoryParam) {
      setActiveFilter(categoryParam)
    }
  }, [categoryParam])

  const handleFilterClick = (slug: string) => {
    setActiveFilter(slug)
    if (slug === 'all') {
      navigate('/services', { replace: true })
    } else {
      navigate(`/services?category=${slug}`, { replace: true })
    }
  }

  const getCatName = (cat: any) => {
    if (!cat.translationKey) return cat.name
    const translated = t(cat.translationKey)
    return translated && translated !== cat.translationKey
      ? translated
      : cat.name
  }

  const getCatImage = (cat: any) => {
    if (cat.imageUrl && !cat.imageUrl.includes('keyboard')) return cat.imageUrl

    // Better dynamic fallback based on name or slug
    const lowerName = cat.name.toLowerCase()
    let query = encodeURIComponent(cat.name.toLowerCase())
    if (lowerName.includes('marketing') || cat.slug === 'marketing')
      query = 'digital%20marketing'
    else if (lowerName.includes('sales') || cat.slug === 'sales-products')
      query = 'business%20sales'
    else if (lowerName.includes('services') || cat.slug === 'home-services')
      query = 'professional%20services'
    else if (lowerName.includes('tech') || cat.slug === 'it-programming')
      query = 'software%20technology'
    else if (lowerName.includes('construction')) query = 'construction%20site'
    else if (lowerName.includes('maintenance')) query = 'building%20maintenance'
    else query = encodeURIComponent(cat.slug.replace('-', ' '))

    return `https://img.usecurling.com/p/600/400?q=${query}&dpr=2`
  }
  // Deduplicate categories by their slug so UI doesn't show copies
  const uniqueCategoriesMap = new Map()
  categories.forEach((cat) => {
    if (!uniqueCategoriesMap.has(cat.slug)) {
      uniqueCategoriesMap.set(cat.slug, cat)
    }
  })
  const uniqueCategories = Array.from(uniqueCategoriesMap.values())

  const filteredCategories = uniqueCategories.filter(
    (cat) => activeFilter === 'all' || cat.slug === activeFilter,
  )

  const isStrictProd =
    typeof window !== 'undefined' && window.location.hostname === 'opporjob.com'

  const validJobs = jobs.filter((j: any) => {
    if (isStrictProd && (j.isDemo || j.is_demo)) return false
    return true
  })

  const filteredJobs =
    activeFilter === 'all'
      ? validJobs
      : validJobs.filter((job) => job.category === activeFilter)

  const visibleCategories = uniqueCategories.slice(0, 5)
  const hiddenCategories = uniqueCategories.slice(5)
  const isHiddenActive = hiddenCategories.some(
    (cat) => cat.slug === activeFilter,
  )

  useEffect(() => {
    const newIds = filteredJobs
      .map((j) => j.id)
      .filter((id) => !trackedIds.has(id))
    if (newIds.length > 0) {
      incrementImpressions(newIds)
      setTrackedIds((prev) => new Set([...prev, ...newIds]))
    }
  }, [filteredJobs, trackedIds, incrementImpressions])

  return (
    <div className="pt-6 md:container md:mx-auto md:max-w-6xl relative min-h-screen pb-20">
      {/* Horizontal Sub-Category Scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide sticky top-16 bg-background z-30 py-2">
        <Badge
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm transition-colors"
          onClick={() => handleFilterClick('all')}
        >
          {t('service.subcategory.all', { defaultValue: 'Todos' })}
        </Badge>
        {visibleCategories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeFilter === cat.slug ? 'default' : 'outline'}
            className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm transition-colors"
            onClick={() => handleFilterClick(cat.slug)}
          >
            {getCatName(cat)}
          </Badge>
        ))}
        {hiddenCategories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant={isHiddenActive ? 'default' : 'outline'}
                className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm transition-colors flex items-center gap-1"
              >
                {t('more', { defaultValue: 'Mais' })}{' '}
                <ChevronDown className="h-3 w-3" />
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 max-h-[300px] overflow-y-auto"
            >
              {hiddenCategories.map((cat) => (
                <DropdownMenuItem
                  key={cat.id}
                  onClick={() => handleFilterClick(cat.slug)}
                  className={activeFilter === cat.slug ? 'bg-muted' : ''}
                >
                  {getCatName(cat)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="px-4 space-y-6">
        <h2 className="text-2xl font-bold">
          {t('services.title', { defaultValue: 'Categorias' })}
        </h2>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {filteredCategories.map((cat) => (
              <ServiceCard
                key={cat.id}
                title={getCatName(cat)}
                image={getCatImage(cat)}
                link={`/find-jobs?category=${cat.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30 animate-in fade-in duration-500">
            <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Sem categorias</h3>
            <p className="text-muted-foreground max-w-sm">
              Nenhuma categoria encontrada para este filtro.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => handleFilterClick('all')}
            >
              Ver todas as categorias
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 space-y-6 mt-10">
        <h2 className="text-2xl font-bold">
          {activeFilter === 'all'
            ? 'Todos os Anúncios'
            : 'Anúncios da Categoria'}
        </h2>

        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
            {filteredJobs.slice(0, 10).map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="block p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {job.photos && job.photos.length > 0 ? (
                    <img
                      src={job.photos[0]}
                      alt={job.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                      <SearchX className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {job.category}
                      </Badge>
                      <span className="text-sm font-medium text-primary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(job.budget || 0)}
                      </span>
                      {(job.isDemo || (job as any).is_demo) && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase ml-auto">
                          {t('demo.badge.job', {
                            defaultValue: 'Anúncio Demo',
                          })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30 animate-in fade-in duration-500">
            <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Sem anúncios</h3>
            <p className="text-muted-foreground max-w-sm">
              Nenhum anúncio encontrado para esta seleção.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link to="/post-job">Criar um anúncio</Link>
            </Button>
          </div>
        )}

        {filteredJobs.length > 10 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" asChild>
              <Link
                to={`/find-jobs${activeFilter !== 'all' ? `?category=${activeFilter}` : ''}`}
              >
                Ver todos os resultados
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
        <Button
          asChild
          className="rounded-full h-14 px-6 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
        >
          <Link to="/post-job">
            <Plus className="h-6 w-6" />
            <span className="text-base">
              {t('services.post_btn', { defaultValue: 'Publicar' })}
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
