import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Coins, Zap, Trophy, Rocket } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function CreditsStore() {
  const { user, buyCredits } = useAuthStore()
  const { toast } = useToast()
  const { t, formatCurrency } = useLanguageStore()

  const handleBuy = (amount: number, price: number) => {
    buyCredits(amount)
    toast({
      title: 'Purchase Successful!',
      description: `You acquired ${amount} credits for ${formatCurrency(price)}.`,
    })
  }

  const creditPackages = [
    { amount: 50, price: 29.9, label: t('credits.beginner'), bonus: 0 },
    { amount: 100, price: 49.9, label: t('credits.popular'), bonus: 10 },
    { amount: 500, price: 199.9, label: t('credits.pro'), bonus: 75 },
  ]

  const boostPackages = [
    {
      title: t('credits.boost.24h'),
      price: 19.9,
      description: t('credits.boost.24h_desc'),
      icon: Zap,
    },
    {
      title: t('credits.boost.7d'),
      price: 49.9,
      description: t('credits.boost.7d_desc'),
      icon: Trophy,
    },
    {
      title: t('credits.boost.profile'),
      price: 29.9,
      description: t('credits.boost.profile_desc'),
      icon: Rocket,
    },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('credits.store_title')}
          </h1>
          <p className="text-muted-foreground">{t('credits.store_desc')}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg text-primary">
            {user?.credits || 0}
          </span>
          <span className="text-sm text-primary/80">
            {t('credits.available')}
          </span>
        </div>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" /> {t('credits.packages')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg, i) => (
              <Card key={i} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{pkg.label}</CardTitle>
                    {pkg.bonus > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {t('credits.bonus', { bonus: String(pkg.bonus) })}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <div className="text-4xl font-bold mb-2">{pkg.amount}</div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                  <div className="mt-4 text-2xl font-bold text-primary">
                    {formatCurrency(pkg.price)}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleBuy(pkg.amount + pkg.bonus, pkg.price)}
                  >
                    {t('credits.buy_now')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5" /> {t('credits.boosts')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boostPackages.map((boost, i) => (
              <Card key={i} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
                    <boost.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{boost.title}</CardTitle>
                  <CardDescription>{boost.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(boost.price)}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: 'Boost Activated!',
                        description: `Package "${boost.title}" was activated.`,
                      })
                    }}
                  >
                    {t('credits.buy_boost')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
