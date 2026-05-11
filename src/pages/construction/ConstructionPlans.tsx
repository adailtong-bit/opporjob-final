import { useConstructionPlansStore } from '@/stores/useConstructionPlansStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Check, HardHat, Building2, Crown } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ConstructionPlans() {
  const { plans, fetchPlans } = useConstructionPlansStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])
  const navigate = useNavigate()
  const { formatCurrency } = useLanguageStore()

  const isAdmin = user?.role === 'admin' || user?.isPremium

  const availablePlans = plans.filter(
    (p) => p.active && p.targetAudience === 'contractor',
  )

  const getIcon = (complexity?: string) => {
    switch (complexity) {
      case 'High':
        return <Crown className="h-6 w-6 md:h-8 md:w-8 text-amber-500 mb-2" />
      case 'Medium':
        return (
          <Building2 className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mb-2" />
        )
      default:
        return (
          <HardHat className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mb-2" />
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 py-8 md:py-10 px-4">
      <div className="text-center space-y-3 md:space-y-4 max-w-2xl mx-auto px-2">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight break-words">
          Planos de Gestão de Obras
        </h1>
        <p className="text-sm md:text-xl text-muted-foreground break-words">
          Escolha o plano ideal para o tamanho e complexidade do seu projeto.
          Desbloqueie ferramentas avançadas de controle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 md:pt-8">
        {availablePlans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative border-border hover:border-primary/50 transition-colors w-full overflow-hidden`}
          >
            <CardHeader className="pb-4">
              {getIcon(plan.complexity)}
              <CardTitle className="text-lg md:text-xl leading-tight break-words">
                {plan.name}
              </CardTitle>
              <div className="mt-2 md:mt-4 flex flex-wrap items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-bold tracking-tight break-all sm:break-words">
                  {isAdmin ? 'Grátis' : formatCurrency(plan.price)}
                </span>
                {!isAdmin && (
                  <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                    /{plan.billingCycle === 'monthly' ? 'mês' : 'ciclo'}
                  </span>
                )}
              </div>
              <CardDescription className="mt-2 min-h-[40px] text-xs md:text-sm leading-relaxed break-words">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.workSize && (
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm leading-tight text-muted-foreground break-words flex-1">
                      Tamanho da Obra:{' '}
                      <strong className="text-foreground block mt-0.5 sm:inline sm:mt-0">
                        {plan.workSize}
                      </strong>
                    </span>
                  </li>
                )}
                {plan.maxProjects && (
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm leading-tight text-muted-foreground break-words flex-1">
                      Limite de Projetos Ativos:{' '}
                      <strong className="text-foreground block mt-0.5 sm:inline sm:mt-0">
                        {plan.maxProjects}
                      </strong>
                    </span>
                  </li>
                )}
                {plan.complexity && (
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm leading-tight text-muted-foreground break-words flex-1">
                      Complexidade de Gestão:{' '}
                      <strong className="text-foreground block mt-0.5 sm:inline sm:mt-0">
                        {plan.complexity === 'Low'
                          ? 'Baixa'
                          : plan.complexity === 'Medium'
                            ? 'Média'
                            : 'Alta'}
                      </strong>
                    </span>
                  </li>
                )}
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm leading-tight text-muted-foreground break-words flex-1">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-2 md:pt-4">
              <Button
                className="w-full text-sm"
                size="lg"
                onClick={() => navigate(`/construction/checkout/${plan.id}`)}
              >
                {isAdmin ? 'Ativar (Admin)' : 'Selecionar Plano'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
