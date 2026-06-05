import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/components/home/ServiceCard'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useJobStore } from '@/stores/useJobStore'

export default function Services() {
  const { t } = useLanguageStore()
  const { categories } = useCategoryStore()
  const { jobs } = useJobStore()
  const [searchParams] = useSearchParams()
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

  const filteredCategories = categories.filter(
    (cat) => activeFilter === 'all' || cat.slug === activeFilter,
  )

  const filteredJobs =
    activeFilter === 'all'
      ? jobs
      : jobs.filter((job) => job.category === activeFilter)

  const defaultImage = 'https://img.usecurling.com/p/400/300?q=services'

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
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeFilter === cat.slug ? 'default' : 'outline'}
            className="flex-shrink-0 cursor-pointer px-4 py-1.5 text-sm transition-colors"
            onClick={() => handleFilterClick(cat.slug)}
          >
            {cat.translationKey
              ? t(cat.translationKey, { defaultValue: cat.name })
              : cat.name}
          </Badge>
        ))}
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
                title={
                  cat.translationKey
                    ? t(cat.translationKey, { defaultValue: cat.name })
                    : cat.name
                }
                image={cat.imageUrl || defaultImage}
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
