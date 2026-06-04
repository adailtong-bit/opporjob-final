import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MapPin,
  Gavel,
  Tag,
  Calendar,
  Filter,
  Zap,
  Sparkles,
  ImageIcon,
} from 'lucide-react'
import { formatDistanceToNow, subDays, isAfter } from 'date-fns'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { AdSection } from '@/components/AdSection'

const hashString = (str: string) => {
  let h = 0
  for (let i = 0; i < str.length; i++)
    h = Math.imul(31 * h + str.charCodeAt(i)) | 0
  return h
}

export default function FindJobs() {
  const { jobs } = useJobStore()
  const { categories } = useCategoryStore()
  const { user } = useAuthStore()
  const { t, formatCurrency, getDateLocale } = useLanguageStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialType = searchParams.get('type') || 'all'

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState(initialType)
  const [dateFilter, setDateFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSmartSort, setIsSmartSort] = useState(false)
  const [sortBy, setSortBy] = useState('recent')

  const isBasicUser = !user || !user.planName || user.planName === 'Básico'

  const availableJobs = jobs.filter((job) => job.status === 'open')
  const regions = Array.from(new Set(jobs.map((j) => j.regionCode))).filter(
    Boolean,
  )

  const jobCategories = useMemo(() => {
    return categories.filter((c) => c.type === 'job')
  }, [categories])

  useEffect(() => {
    const tParam = searchParams.get('type') || 'all'
    setTypeFilter(tParam)
  }, [searchParams])

  const handleTypeChange = (val: string) => {
    setTypeFilter(val)
    setSearchParams(
      (prev) => {
        if (val === 'all') {
          prev.delete('type')
        } else {
          prev.set('type', val)
        }
        return prev
      },
      { replace: true },
    )
  }

  const filteredJobs = useMemo(() => {
    const now = new Date()
    const twentyFourHoursAgo = subDays(now, 1)

    return availableJobs
      .filter((job) => {
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory =
          categoryFilter === 'all' || job.category === categoryFilter
        const matchesType =
          typeFilter === 'all' || job.listingType === typeFilter
        const matchesRegion =
          regionFilter === 'all' || job.regionCode === regionFilter

        let matchesDate = true
        if (dateFilter !== 'all') {
          let cutoffDate = new Date()
          if (dateFilter === '24h') cutoffDate = subDays(now, 1)
          if (dateFilter === '7d') cutoffDate = subDays(now, 7)
          if (dateFilter === '30d') cutoffDate = subDays(now, 30)

          matchesDate = isAfter(new Date(job.createdAt), cutoffDate)
        }

        if (dateFrom) {
          if (new Date(job.createdAt) < new Date(dateFrom)) matchesDate = false
        }
        if (dateTo) {
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (new Date(job.createdAt) > toDate) matchesDate = false
        }

        let matchesBudget = true
        const jobPrice = job.budget || job.salePrice || job.rentalRate || 0
        if (minBudget && jobPrice < Number(minBudget)) matchesBudget = false
        if (maxBudget && jobPrice > Number(maxBudget)) matchesBudget = false

        if (isBasicUser) {
          const isNewListing = isAfter(
            new Date(job.createdAt),
            twentyFourHoursAgo,
          )
          const isPriorityListing =
            job.premiumType !== 'none' ||
            (job.creatorPlan && job.creatorPlan !== 'Básico')

          if (isNewListing || isPriorityListing) {
            return false
          }
        }

        return (
          matchesSearch &&
          matchesCategory &&
          matchesType &&
          matchesRegion &&
          matchesDate &&
          matchesBudget
        )
      })
      .sort((a, b) => {
        if (isSmartSort) {
          return (b.smartMatchScore || 0) - (a.smartMatchScore || 0)
        }

        if (sortBy === 'rating') {
          return (b.smartMatchScore || 0) - (a.smartMatchScore || 0) // Mocking rating sort
        }
        if (sortBy === 'proximity') {
          return a.location.localeCompare(b.location) // Mocking proximity
        }

        if (isBasicUser) {
          return hashString(a.id) - hashString(b.id)
        } else {
          const getPlanWeight = (plan?: string) => {
            switch (plan) {
              case 'Enterprise':
                return 5
              case 'Premium':
                return 4
              case 'Ouro':
                return 3
              case 'Prata':
                return 2
              case 'Bronze':
                return 1
              default:
                return 0
            }
          }

          const scoreA =
            getPlanWeight(a.creatorPlan) + (a.premiumType !== 'none' ? 10 : 0)
          const scoreB =
            getPlanWeight(b.creatorPlan) + (b.premiumType !== 'none' ? 10 : 0)

          if (scoreA !== scoreB) {
            return scoreB - scoreA
          }

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }
      })
  }, [
    availableJobs,
    searchTerm,
    categoryFilter,
    typeFilter,
    dateFilter,
    regionFilter,
    isBasicUser,
    isSmartSort,
    minBudget,
    maxBudget,
    dateFrom,
    dateTo,
  ])

  return (
    <div className="space-y-6 container mx-auto max-w-6xl pb-20 pt-4">
      <AdSection segment="search" />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('find.title')}</h1>
        <p className="text-muted-foreground">{t('find.desc')}</p>

        {isBasicUser && (
          <div className="bg-muted p-3 rounded-md text-sm border flex items-center gap-2 mt-2">
            <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              <span
                dangerouslySetInnerHTML={{ __html: t('find.basic_plan_alert') }}
              />{' '}
              <Link
                to="/subscription"
                className="text-primary hover:underline font-semibold"
              >
                {t('find.upgrade')}
              </Link>{' '}
              {t('find.basic_plan_alert_suffix')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('find.search_placeholder')}
              className="pl-9 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showAdvanced ? 'Ocultar Filtros' : 'Filtros Avançados'}
          </Button>

          <div className="flex items-center space-x-2 bg-background p-2 rounded-md border shadow-sm shrink-0">
            <Switch
              id="smart-mode"
              checked={isSmartSort}
              onCheckedChange={setIsSmartSort}
            />
            <Label
              htmlFor="smart-mode"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Sparkles
                className={`h-4 w-4 ${isSmartSort ? 'text-purple-500 fill-purple-100' : 'text-muted-foreground'}`}
              />
              {t('find.smart_sort')}
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Estado / Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('find.filter.region.all')}</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('find.filter.category.all')}
              </SelectItem>
              {jobCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.translationKey ? t(cat.translationKey) : cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={t('find.filter.type.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('find.filter.type.all')}</SelectItem>
              <SelectItem value="job">{t('post.type.job.label')}</SelectItem>
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

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('find.filter.date.all')}</SelectItem>
              <SelectItem value="24h">{t('find.filter.date.24h')}</SelectItem>
              <SelectItem value="7d">{t('find.filter.date.7d')}</SelectItem>
              <SelectItem value="30d">{t('find.filter.date.30d')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={t('general.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('find.sort.recent')}</SelectItem>
              <SelectItem value="rating">{t('find.sort.rating')}</SelectItem>
              <SelectItem value="proximity">
                {t('find.sort.proximity')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2 animate-fade-in border-t pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t('find.filter.budget_min')}
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t('find.filter.budget_max')}
              </Label>
              <Input
                type="number"
                placeholder="9999"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t('find.filter.date_from')}
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t('find.filter.date_to')}
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => {
          let displayPrice = job.budget || 0
          if (job.listingType === 'product' || job.listingType === 'community')
            displayPrice = job.salePrice || 0
          if (job.listingType === 'rental') displayPrice = job.rentalRate || 0

          return (
            <Card
              key={job.id}
              className={`flex flex-col hover:border-primary/50 transition-colors ${
                job.premiumType === 'category' ||
                (job.creatorPlan && job.creatorPlan !== 'Básico')
                  ? 'border-l-4 border-l-yellow-500 shadow-md bg-yellow-50/10'
                  : job.premiumType === 'region'
                    ? 'border-l-4 border-l-blue-500 shadow-sm'
                    : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {categories.find((c) => c.name === job.category)
                        ?.translationKey
                        ? t(
                            categories.find((c) => c.name === job.category)!
                              .translationKey!,
                          )
                        : job.category}
                    </Badge>
                    {job.listingType && job.listingType !== 'job' && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 uppercase text-[10px]">
                        {job.listingType}
                      </Badge>
                    )}
                    {isSmartSort && job.smartMatchScore && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                        {job.smartMatchScore}% Match
                      </Badge>
                    )}
                    {(job.premiumType !== 'none' ||
                      (job.creatorPlan && job.creatorPlan !== 'Básico')) &&
                      !isSmartSort && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1 text-[10px]"
                        >
                          <Zap className="h-3 w-3 fill-current" />{' '}
                          {job.creatorPlan && job.creatorPlan !== 'Básico'
                            ? job.creatorPlan
                            : t('ad.highlight')}
                        </Badge>
                      )}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(job.createdAt, {
                      addSuffix: true,
                      locale: getDateLocale(),
                    })}
                  </span>
                </div>
                <CardTitle className="line-clamp-1 text-lg">
                  {job.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  {job.photos && job.photos.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <ImageIcon className="h-3 w-3" /> {job.photos.length}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {job.type === 'auction' && job.listingType === 'job' ? (
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 flex gap-1"
                    >
                      <Gavel className="h-3 w-3" /> {t('job.auction_reverse')}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex gap-1"
                    >
                      <Tag className="h-3 w-3" />{' '}
                      {job.listingType === 'job'
                        ? t('job.fixed_price')
                        : 'Valor'}
                    </Badge>
                  )}
                  <span className="font-bold text-lg text-primary">
                    {displayPrice === 0
                      ? 'Grátis'
                      : formatCurrency(displayPrice, (job as any).currency)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full" asChild>
                  <Link to={`/jobs/${job.id}`}>{t('view')}</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
        {filteredJobs.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Filter className="h-10 w-10 mb-4 opacity-20" />
            <p>{t('job.not_found')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
