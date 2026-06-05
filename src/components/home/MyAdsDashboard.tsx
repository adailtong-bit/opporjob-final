import { useState } from 'react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit, Trash2, Search, Eye, BarChart, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/SafeImage'

export function MyAdsDashboard() {
  const { t, formatDate } = useLanguageStore()
  const { user } = useAuthStore()
  const { jobs, deleteJob } = useJobStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  if (!user) return null

  const myAds = jobs.filter((job) => job.ownerId === user.id)

  if (myAds.length === 0) return null

  const filteredAds = myAds.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      filterType === 'all' || (ad.listingType || 'job') === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{t('home.my_ads.title')}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('home.my_ads.search')}
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder={t('home.my_ads.filter.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('home.my_ads.filter.all')}</SelectItem>
              <SelectItem value="job">{t('post.type.job.label')}</SelectItem>
              <SelectItem value="service">
                {t('post.type.service.label')}
              </SelectItem>
              <SelectItem value="product">
                {t('post.type.product.label')}
              </SelectItem>
              <SelectItem value="rental">
                {t('post.type.rental.label')}
              </SelectItem>
              <SelectItem value="community">
                {t('post.type.community.label')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
          Nenhum anúncio encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map((ad) => {
            const isLiteralServiceLabel =
              ad.listingType?.toLowerCase() === 'post.type.service.label'
            const rawType = (ad.listingType || 'job')
              .toLowerCase()
              .replace('post.type.', '')
              .replace('.label', '')

            const translatedType = isLiteralServiceLabel
              ? t('post.type.service.label')
              : t(`post.type.${rawType}.label`) || ad.listingType

            const views = ad.viewsCount || 0
            const impressions = ad.impressionsCount || 0
            const exposureLevel =
              impressions > 100 ? 'Alta' : impressions > 20 ? 'Média' : 'Baixa'
            const exposureColor =
              exposureLevel === 'Alta'
                ? 'text-green-600'
                : exposureLevel === 'Média'
                  ? 'text-yellow-600'
                  : 'text-slate-500'

            return (
              <Card
                key={ad.id}
                className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors shadow-sm"
              >
                {ad.photos && ad.photos.length > 0 && (
                  <div className="h-40 w-full bg-muted relative group">
                    <SafeImage
                      src={ad.photos[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-2 left-2 shadow-sm capitalize bg-black/70 text-white hover:bg-black/80">
                      {translatedType}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4 flex-1 flex flex-col">
                  {!ad.photos?.length && (
                    <Badge className="w-fit mb-3 capitalize bg-primary/10 text-primary hover:bg-primary/20">
                      {translatedType}
                    </Badge>
                  )}
                  <h3 className="font-bold text-lg line-clamp-2 leading-tight">
                    {ad.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-2 gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />{' '}
                    <span className="truncate">{ad.location || 'Remoto'}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-0.5">
                        <Eye className="w-3.5 h-3.5" /> Visualizações
                      </span>
                      <span className="font-bold text-base">{views}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-0.5">
                        <BarChart className="w-3.5 h-3.5" /> Nível de Exposição
                      </span>
                      <span className={`font-bold text-base ${exposureColor}`}>
                        {exposureLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-5">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {formatDate(ad.createdAt, 'dd MMM yyyy')}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => navigate(`/post-job?edit=${ad.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1.5" /> Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (confirm(t('delete.confirm'))) {
                            deleteJob(ad.id)
                            toast({
                              title: t('success'),
                              description: t('home.my_ads.delete_success'),
                            })
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
