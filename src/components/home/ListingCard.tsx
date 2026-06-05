import { Card, CardContent } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { SafeImage } from '@/components/SafeImage'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { cn, formatCurrencyValue } from '@/lib/utils'
import { useJobStore } from '@/stores/useJobStore'

interface ListingProps {
  id: string
  image: string
  title: string
  price: number
  location?: string
  status?: string
  isDemo?: boolean
}

export function ListingCard({
  id,
  image,
  title,
  price,
  location,
  status,
  isDemo,
}: ListingProps) {
  const { t } = useLanguageStore()
  const { getJob } = useJobStore()
  const job = getJob(id)
  const showDemo = isDemo || (job as any)?.is_demo || (job as any)?.isDemo

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <Link to={`/jobs/${id}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          <SafeImage
            src={image}
            alt={title}
            fallbackSrc="https://img.usecurling.com/p/400/400?q=package"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {showDemo && (
            <Badge
              variant="default"
              className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold tracking-wider uppercase text-[10px] z-10"
            >
              {t('demo.badge.job') || 'Anúncio Demo'}
            </Badge>
          )}
          {status && (
            <Badge
              variant={status === 'open' ? 'default' : 'secondary'}
              className={cn(
                'absolute top-2 left-2 shadow-sm font-semibold z-10',
                status === 'completed' &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive',
              )}
            >
              {status === 'open'
                ? 'Available'
                : status === 'completed'
                  ? 'Closed'
                  : 'In Negotiation'}
            </Badge>
          )}
          {/* Mock Online Status Badge */}
          <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 z-10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </div>
        </div>
        <CardContent className="p-3 relative">
          <Badge
            variant="outline"
            className="absolute -top-3 right-2 bg-background text-[10px] h-5 border-blue-200 text-blue-700 font-semibold shadow-sm z-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Verificado
          </Badge>
          <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] leading-tight">
            {title}
          </h3>
          <p className="font-bold text-lg mt-1 text-primary">
            {price === 0
              ? 'Free'
              : formatCurrencyValue(price, (job as any)?.currency || 'USD')}
          </p>
          {location && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {location}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
