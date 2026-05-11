import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useConstructionPlansStore } from '@/stores/useConstructionPlansStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function SubscriptionPlans() {
  const { user, upgradeSubscription } = useAuthStore()
  const { plans, fetchPlans } = useConstructionPlansStore()
  const { toast } = useToast()
  const { formatCurrency, t } = useLanguageStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleSubscribe = (tierName: string) => {
    if (upgradeSubscription) {
      upgradeSubscription('pro')
    }
    toast({
      title: t('sub.updated.title') || 'Plano Atualizado',
      description:
        t('sub.updated.desc', { tierName }) ||
        `Seu plano foi atualizado para ${tierName}.`,
    })
  }

  // Filter plans straight from the real unified database table, avoiding mock conflicts
  const availablePlans = plans.filter((p) => {
    if (!p.active) return false

    if (user) {
      if (user.role === 'executor' || user.role === 'contractor') {
        return (
          p.targetAudience === 'contractor' ||
          p.targetAudience === 'executor' ||
          p.targetAudience === 'both'
        )
      } else if (user.role === 'employer' || user.role === 'client') {
        return (
          p.targetAudience === 'employer' ||
          p.targetAudience === 'contractor' ||
          p.targetAudience === 'both'
        )
      } else if (user.role === 'partner') {
        return p.targetAudience === 'advertiser' || p.targetAudience === 'both'
      } else if (user.role === 'admin') {
        return true
      }
    }

    return true
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t('sub.plans.title') || 'Planos de Assinatura'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('sub.plans.subtitle') ||
            'Escolha o plano ideal que se adapta às suas necessidades.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 items-stretch">
        {availablePlans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative h-full transition-all duration-300 ${
              plan.popular
                ? 'border-primary shadow-xl lg:scale-105 z-10'
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm shadow-sm">
                  {t('sub.plans.most_popular') || 'Mais Popular'}
                </Badge>
              </div>
            )}
            <CardHeader className="space-y-4 pb-4 grow-0 flex flex-col items-center text-center">
              <div
                className={`p-3 rounded-full shrink-0 ${
                  plan.popular
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Crown className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl leading-tight break-words w-full">
                {plan.name}
              </CardTitle>
              <div className="flex flex-row flex-wrap items-baseline justify-center gap-1.5 w-full">
                <span className="text-xl md:text-2xl font-bold tracking-tight break-words max-w-full">
                  {formatCurrency
                    ? formatCurrency(plan.price)
                    : `$${plan.price}`}
                </span>
                {plan.price !== 0 && (
                  <span className="text-muted-foreground text-sm font-medium whitespace-nowrap shrink-0">
                    /
                    {plan.billingCycle === 'monthly'
                      ? t('sub.plans.month') || 'mês'
                      : t('sub.plans.cycle') || 'ciclo'}
                  </span>
                )}
              </div>
              <CardDescription className="min-h-[48px] text-sm leading-relaxed break-words whitespace-normal w-full px-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-6 flex flex-col items-center w-full">
              <ul className="space-y-3 w-full max-w-[280px]">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm leading-tight break-words flex-1 whitespace-normal text-left">
                      {feature}
                    </span>
                  </li>
                ))}
                {(!plan.features || plan.features.length === 0) && (
                  <li className="text-sm text-muted-foreground italic text-center w-full">
                    Recursos básicos inclusos
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter className="pt-0 mt-auto shrink-0 w-full">
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.name)}
              >
                {t('sub.plans.subscribe') || 'Assinar Agora'}
              </Button>
            </CardFooter>
          </Card>
        ))}
        {availablePlans.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            Nenhum plano configurado no sistema no momento.
          </div>
        )}
      </div>
    </div>
  )
}
