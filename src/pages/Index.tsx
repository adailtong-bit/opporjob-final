import { useLanguageStore } from '@/stores/useLanguageStore'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ListingCard } from '@/components/home/ListingCard'
import { MyAdsDashboard } from '@/components/home/MyAdsDashboard'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, Share2, Bell, BellOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useJobStore } from '@/stores/useJobStore'
import { usePWA } from '@/hooks/use-pwa'
import { ProximityMap } from '@/components/home/ProximityMap'
import { useState, useEffect } from 'react'

export default function Index() {
  const { isInstallable, installPWA, shareContent, setBadge, clearBadge } =
    usePWA()
  const { t } = useLanguageStore()
  const { jobs, incrementImpressions } = useJobStore()
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set())

  // Filter out test/dummy data for production
  const isProd =
    import.meta.env.PROD ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost')

  const isStrictProd =
    typeof window !== 'undefined' && window.location.hostname === 'opporjob.com'

  const validJobs = jobs.filter((j: any) => {
    if (j.isDemo || j.is_demo) return true

    if (!isProd && !isStrictProd) return true

    // Strict production filter as defined in the system policies
    // Only explicitly published records are allowed in production
    if (j.is_published !== true && isStrictProd) return false

    const isTestFlag = j.is_test || j.isTest || j.status === 'test'
    if (isTestFlag && isStrictProd) return false

    const titleLower = (j.title || '').toLowerCase()
    const descLower = (j.description || '').toLowerCase()
    const hasTestWord =
      titleLower.includes('test') ||
      titleLower.includes('mock') ||
      titleLower.includes('fictício') ||
      titleLower.includes('ficticio') ||
      titleLower.includes('demo') ||
      titleLower.includes('lorem') ||
      titleLower.includes('ipsum') ||
      descLower.includes('test') ||
      descLower.includes('mock') ||
      descLower.includes('lorem')

    if (hasTestWord && isStrictProd) return false

    return true
  })

  const mappedListings = validJobs.map((j) => {
    let tabType = 'jobs'
    if (j.listingType === 'rental') tabType = 'rentals'
    if (j.listingType === 'product') {
      tabType = j.salePrice === 0 || j.budget === 0 ? 'donation' : 'marketplace'
    }
    if (j.listingType === 'community') tabType = 'donation'

    return {
      id: j.id,
      title: j.title,
      price:
        j.listingType === 'product' || j.listingType === 'community'
          ? (j.salePrice ?? j.budget)
          : j.listingType === 'rental'
            ? (j.rentalRate ?? j.budget)
            : j.budget,
      image: j.photos?.[0] || 'https://img.usecurling.com/p/400/400?q=package',
      location: j.location,
      type: tabType,
      status: j.status,
      isDemo: j.isDemo || j.is_demo,
    }
  })

  useEffect(() => {
    const newIds = mappedListings
      .map((j) => j.id)
      .filter((id) => !trackedIds.has(id))
    if (newIds.length > 0) {
      incrementImpressions(newIds)
      setTrackedIds((prev) => new Set([...prev, ...newIds]))
    }
  }, [mappedListings, trackedIds, incrementImpressions])

  const renderSection = (title: string, type: string, filterType: string) => {
    const items = mappedListings
      .filter((item) => item.type === type)
      .slice(0, 4)
    if (items.length === 0) return null

    return (
      <Card className="border-none shadow-sm mb-6 bg-muted/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link to={`/find-jobs?type=${filterType}`}>
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                location={item.location}
                status={item.status}
                isDemo={item.isDemo}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full mt-4 sm:hidden"
          >
            <Link to={`/find-jobs?type=${filterType}`}>
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2 pt-2 md:container md:mx-auto md:max-w-6xl pb-20">
      <CategoryTiles />
      <PromoBanner />
      <MyAdsDashboard />

      {isInstallable && (
        <div className="px-4 mt-4">
          <Card className="bg-primary text-primary-foreground border-none shadow-lg animate-fade-in-up">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {t('pwa.install.title', undefined) || 'Install OPPORJOB App'}
                </h3>
                <p className="text-sm text-primary-foreground/90">
                  {t('pwa.install.desc', undefined) ||
                    'Access quickly, receive notifications and use offline!'}
                </p>
              </div>
              <Button
                onClick={installPWA}
                variant="secondary"
                className="gap-2 font-bold whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                {t('pwa.install.btn', undefined) || 'Install'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PWA Feature Showcase / Quick Actions */}
      <div className="px-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          variant="outline"
          className="gap-2 w-full bg-card shadow-sm hover:bg-muted"
          onClick={() =>
            shareContent({
              title: 'OPPORJOB',
              text: 'Find the best projects and experts on OPPORJOB!',
              url: window.location.origin,
            })
          }
        >
          <Share2 className="h-4 w-4 text-primary" />
          {t('pwa.share', undefined) || 'Share App'}
        </Button>
        <Button
          variant="outline"
          className="gap-2 w-full bg-card shadow-sm hover:bg-muted"
          onClick={() => setBadge(3)}
        >
          <Bell className="h-4 w-4 text-primary" />
          {t('pwa.test_badge', undefined) || 'Test Badge (3)'}
        </Button>
        <Button
          variant="outline"
          className="gap-2 w-full bg-card shadow-sm hover:bg-muted md:col-span-2"
          onClick={() => clearBadge()}
        >
          <BellOff className="h-4 w-4 text-primary" />
          {t('pwa.clear_badge', undefined) || 'Clear Notifications'}
        </Button>
      </div>

      <div className="px-4 mt-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">
            Profissionais e Serviços Próximos
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Encontre especialistas disponíveis na sua região pelo mapa
            interativo.
          </p>
          <ProximityMap />
        </div>
        <div className="space-y-2 pt-2">
          {renderSection('Marketplace', 'marketplace', 'product')}
          {renderSection('Donations & Community', 'donation', 'community')}
          {renderSection('Rentals', 'rentals', 'rental')}
          {renderSection('Featured Jobs', 'jobs', 'job')}
        </div>
      </div>
    </div>
  )
}
