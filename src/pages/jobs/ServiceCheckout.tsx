import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useInvoices } from '@/hooks/use-invoices'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ServiceCheckout() {
  const { providerId } = useParams<{ providerId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createInvoice } = useInvoices(user?.id)
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()
  const { t, formatCurrency, currency } = useLanguageStore()

  const serviceName = searchParams.get('service') || 'Serviço Personalizado'
  const priceParam = searchParams.get('price')
  const amount = priceParam ? parseFloat(priceParam) : 0

  const [providerName, setProviderName] = useState('Profissional')
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProvider() {
      if (!providerId) return
      try {
        const { data } = await supabase
          .from('profiles')
          .select('name, company_name')
          .eq('id', providerId)
          .single()
        if (data) {
          setProviderName(data.company_name || data.name || 'Profissional')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProvider()
  }, [providerId])

  if (loading)
    return (
      <div className="p-8 text-center flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )

  if (!user || !providerId)
    return <div className="p-8 text-center">Dados Inválidos</div>

  const handlePayment = async () => {
    setIsProcessing(true)

    const success = await createInvoice({
      payer_id: user.id,
      receiver_id: providerId,
      amount: amount * 1.05,
      currency: currency || 'USD',
      description: `Reserva de Serviço: ${serviceName}`,
      status: 'escrow',
      type: 'service_booking',
    })

    if (success) {
      addNotification({
        userId: providerId,
        title: 'Nova Solicitação de Serviço!',
        message: `${user.name} solicitou o serviço "${serviceName}" e realizou o pré-pagamento.`,
        type: 'success',
        link: `/messages`,
      })

      setIsProcessing(false)
      toast({
        title: 'Reserva confirmada!',
        description: 'O profissional foi notificado.',
      })
      navigate('/payment/success')
    } else {
      setIsProcessing(false)
      toast({
        variant: 'destructive',
        title: 'Erro no pagamento',
        description: 'Não foi possível processar a reserva. Tente novamente.',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Perfil
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reserva de Serviço
        </h1>
        <p className="text-muted-foreground mt-2">
          Revise as informações e garanta sua reserva com o profissional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid gap-4"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="credit-card" id="cc" />
                  <Label
                    htmlFor="cc"
                    className="flex items-center gap-2 cursor-pointer w-full font-medium"
                  >
                    <CreditCard className="h-5 w-5 text-blue-600" /> Cartão de
                    Crédito
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'credit-card' && (
                <div className="mt-6 p-4 bg-muted/30 border border-dashed rounded-lg text-sm text-center text-muted-foreground">
                  Modo Simulação Ativo. Nenhuma cobrança real será processada
                  neste ambiente.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 text-sm text-muted-foreground bg-green-50/50 p-4 rounded-lg border border-green-100">
            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-green-800">
                Pagamento Protegido
              </p>
              <p className="leading-relaxed">
                Seu pagamento fica em custódia (Escrow) e só é repassado ao
                profissional após a conclusão e aprovação do serviço.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle>Resumo da Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Serviço Selecionado
                </p>
                <p className="font-semibold text-[15px]">{serviceName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Profissional
                </p>
                <p className="font-semibold text-[15px]">{providerName}</p>
              </div>
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal do Serviço
                  </span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxa de Proteção da Plataforma (5%)</span>
                  <span>{formatCurrency(amount * 0.05)}</span>
                </div>
              </div>
              <div className="border-t pt-4 mt-2 flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Total a Pagar
                </span>
                <span className="text-3xl font-bold text-primary tracking-tight">
                  {formatCurrency(amount * 1.05)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
              <Button
                className="w-full h-12 text-base shadow-sm"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                    Processando...
                  </>
                ) : (
                  <>Confirmar Reserva</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
