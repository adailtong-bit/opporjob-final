import { Card, CardContent } from '@/components/ui/card'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { SafeImage } from '@/components/SafeImage'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ListingProps {
  id: string
  image: string
  title: string
  price: number
  location?: string
  status?: string
}

export function ListingCard({
  id,
  image,
  title,
  price,
  location,
  status,
}: ListingProps) {
  const { formatCurrency } = useLanguageStore()

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
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] leading-tight">
            {title}
          </h3>
          <p className="font-bold text-lg mt-1 text-primary">
            {price === 0 ? 'Free' : formatCurrency(price)}
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
