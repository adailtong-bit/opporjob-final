import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConstructionPlansStore } from '@/stores/useConstructionPlansStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, HardHat } from 'lucide-react'
import { formatCurrencyValue } from '@/lib/utils'

export default function ConstructionPlans() {
  const navigate = useNavigate()
  const { plans, fetchPlans, loading } = useConstructionPlansStore()
  const { t } = useLanguageStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  // Retorna os planos sincronizados da base de dados e que estão ativos
  const activePlans = plans.filter((p) => p.active)

  const getCycleLabel = (val: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      'semi-annually': 'Semestral',
      yearly: 'Anual',
    }
    return labels[val] || val
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Carregando planos sincronizados...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <HardHat className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Planos de Gestão de Obras
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano ideal que se adapta perfeitamente às suas
          necessidades, seja você profissional ou cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activePlans.length > 0 ? (
          activePlans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col relative overflow-hidden border-2 hover:border-primary/50 transition-colors duration-300"
            >
              {plan.targetAudience === 'contractor' && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm">
                  Profissionais
                </div>
              )}
              {plan.targetAudience === 'employer' && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm">
                  Clientes
                </div>
              )}
              {plan.targetAudience === 'both' && (
                <div className="absolute top-0 right-0 bg-slate-800 text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm">
                  Global
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px] text-sm mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {formatCurrencyValue(plan.price, 'BRL')}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    /{getCycleLabel(plan.billingCycle)}
                  </span>
                </div>

                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground font-medium">
                      Limite de Obras
                    </span>
                    <Badge variant="outline" className="bg-background">
                      {plan.maxProjects}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground font-medium">
                      Porte
                    </span>
                    <span className="font-semibold text-foreground">
                      {plan.workSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">
                      Complexidade
                    </span>
                    <span className="font-semibold text-foreground">
                      {plan.complexity}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm font-semibold mb-3">
                    O que está incluso:
                  </p>
                  <ul className="space-y-3">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-muted-foreground leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                      <li className="text-sm text-muted-foreground italic">
                        Funcionalidades básicas do sistema.
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Button
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  onClick={() => navigate(`/construction/checkout/${plan.id}`)}
                >
                  Assinar Agora
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
            <p className="text-lg font-medium">
              Nenhum plano disponível no momento.
            </p>
            <p className="text-sm">
              Os administradores estão configurando as melhores opções para
              você.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
