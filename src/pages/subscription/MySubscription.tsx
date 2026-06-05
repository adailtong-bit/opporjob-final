import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  ShieldCheck,
  Crown,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrencyValue } from '@/lib/utils'

export default function MySubscription() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    setLoading(true)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, plan:construction_plans(*)')
      .eq('id', user?.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      if (profileData.plan) {
        setPlan(profileData.plan)
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando detalhes do plano...
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <Card className="text-center py-10">
          <CardHeader>
            <CardTitle className="text-2xl">Nenhum plano ativo</CardTitle>
            <CardDescription>
              Você atualmente está no plano gratuito (Básico).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Crown className="h-16 w-16 text-muted-foreground opacity-20" />
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild size="lg">
              <Link to="/subscription">Fazer Upgrade Agora</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isActive =
    profile?.subscription_status === 'active' || profile?.status === 'active'
  const isExpired = profile?.subscription_status === 'expired'

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Meu Plano e Benefícios
          </h1>
          <p className="text-muted-foreground">
            Transparência e validade jurídica dos seus direitos contratados.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/subscription">Ver Outros Planos</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card
            className={`border-2 ${isActive ? 'border-green-500' : isExpired ? 'border-destructive' : 'border-border'}`}
          >
            <CardHeader className="pb-4 bg-muted/20">
              <CardTitle className="text-xl flex items-center justify-between">
                {plan.name}
                <Badge
                  variant={isActive ? 'default' : 'destructive'}
                  className={isActive ? 'bg-green-600' : ''}
                >
                  {isActive ? 'Ativo' : isExpired ? 'Expirado' : 'Pendente'}
                </Badge>
              </CardTitle>
              <CardDescription className="font-semibold text-lg text-foreground mt-2">
                {formatCurrencyValue(plan.price, plan.currency || 'USD')}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billing_cycle === 'yearly' ? 'ano' : 'mês'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Data de Contratação</p>
                  <p className="text-muted-foreground">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'Não disponível'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <AlertTriangle
                  className={`h-5 w-5 shrink-0 ${isExpired ? 'text-destructive' : 'text-primary'}`}
                />
                <div>
                  <p className="font-medium">Válido até</p>
                  <p
                    className={`font-semibold ${isExpired ? 'text-destructive' : ''}`}
                  >
                    {profile.subscription_end_date
                      ? new Date(
                          profile.subscription_end_date,
                        ).toLocaleDateString()
                      : 'Renovação Automática'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {isExpired ? (
                <Button className="w-full" variant="destructive" asChild>
                  <Link to="/subscription">Renovar Assinatura</Link>
                </Button>
              ) : (
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/finance">Ver Faturas</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Jurídicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Sua assinatura garante o acesso aos benefícios listados à
                direita durante todo o período de vigência. Em caso de
                cancelamento ou falha no pagamento, o acesso às funcionalidades
                premium será imediatamente restrito.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">
                Seus Direitos e Funcionalidades
              </CardTitle>
              <CardDescription>
                Lista completa de benefícios vinculados ao seu perfil (
                {plan.target_audience === 'both'
                  ? 'Global'
                  : plan.target_audience === 'provider'
                    ? 'Prestador'
                    : 'Anunciante'}
                ) e tipo de entidade (
                {plan.entity_type === 'both'
                  ? 'Global'
                  : plan.entity_type === 'pj'
                    ? 'Pessoa Jurídica'
                    : 'Pessoa Física'}
                ).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">
                  Privilégios da Plataforma
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {plan.early_access_hours > 0 && (
                    <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-md border border-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-primary">
                          Acesso Antecipado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Você visualiza vagas {plan.early_access_hours} horas
                          antes.
                        </p>
                      </div>
                    </div>
                  )}
                  {plan.visibility_boost > 1 && (
                    <div className="flex items-start gap-2 bg-orange-500/5 p-3 rounded-md border border-orange-500/10">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-orange-600">
                          Impulso de Visibilidade
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Seu perfil aparece com peso {plan.visibility_boost}x
                          maior nas buscas.
                        </p>
                      </div>
                    </div>
                  )}
                  {plan.priority_weight > 1 && (
                    <div className="flex items-start gap-2 bg-blue-500/5 p-3 rounded-md border border-blue-500/10">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-blue-600">
                          Destaque nas Propostas
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Suas propostas são destacadas para o contratante.
                        </p>
                      </div>
                    </div>
                  )}
                  {plan.push_enabled && (
                    <div className="flex items-start gap-2 bg-purple-500/5 p-3 rounded-md border border-purple-500/10">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-purple-600">
                          Alertas Instantâneos (Push)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receba vagas no celular imediatamente.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">
                  Itens Inclusos no Plano
                </h4>
                <ul className="space-y-3">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-sm">{feat}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground text-sm italic">
                      Nenhum recurso extra listado.
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="font-semibold border-b pb-2">
                  Limites Operacionais
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-muted px-4 py-2 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Máximo de Projetos Simultâneos
                    </p>
                    <p className="font-bold">
                      {plan.max_projects || 'Ilimitado'}
                    </p>
                  </div>
                  <div className="bg-muted px-4 py-2 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Porte de Obra Permitido
                    </p>
                    <p className="font-bold capitalize">
                      {plan.work_size || 'Qualquer'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
