import { useLanguageStore } from '@/stores/useLanguageStore'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ListingCard } from '@/components/home/ListingCard'
import { MyAdsDashboard } from '@/components/home/MyAdsDashboard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useJobStore } from '@/stores/useJobStore'

export default function Index() {
  const { t } = useLanguageStore()
  const { jobs } = useJobStore()

  // Filter out test/dummy data for production
  const isProd =
    import.meta.env.PROD ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost')

  const validJobs = jobs.filter((j: any) => {
    if (!isProd) return true

    // Strict production filter as defined in the system policies
    // Only explicitly published records are allowed in production
    if (j.is_published !== true) return false

    const isTestFlag = j.is_test || j.isTest || j.status === 'test'
    if (isTestFlag) return false

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

    return !hasTestWord
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
    }
  })

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

      <div className="px-4 mt-2">
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
