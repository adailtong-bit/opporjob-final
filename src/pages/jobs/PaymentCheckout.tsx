import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/stores/useJobStore'
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
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { formatCurrencyValue } from '@/lib/utils'

export default function PaymentCheckout() {
  const { jobId, bidId } = useParams<{ jobId: string; bidId: string }>()
  const navigate = useNavigate()
  const { getJob, acceptBid } = useJobStore()
  const { user } = useAuthStore()
  const { createInvoice } = useInvoices(user?.id)
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()

  // Utilizando o contexto de formatação global e região (i18n)
  const { t } = useLanguageStore()

  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)

  const job = getJob(jobId!)

  // Lógica para determinar o valor e o prestador do serviço
  const bid =
    bidId && bidId !== 'fixed' ? job?.bids.find((b) => b.id === bidId) : null

  const amount = bid ? bid.amount : job?.budget || 0
  const receiverName = bid ? bid.executorName : 'Professional (TBD)'
  const receiverId = bid ? bid.executorId : 'pending'

  if (!job || !user)
    return <div className="p-8 text-center">Invalid data / Dados Inválidos</div>

  const handlePayment = async () => {
    setIsProcessing(true)

    // A geração de Invoices agora respeita a moeda global configurada pelo Profile do usuário.
    const success = await createInvoice({
      job_id: job.id,
      payer_id: user.id,
      receiver_id: receiverId !== 'pending' ? receiverId : undefined,
      amount: amount,
      currency: job.currency || 'BRL',
      description: job.title,
      status: 'escrow',
      type: 'service',
    })

    if (success) {
      if (bid) {
        acceptBid(job.id, bid.id)

        addNotification({
          userId: bid.executorId,
          title: 'Proposal Accepted & Paid!',
          message: `The contractor paid ${formatCurrencyValue(amount, job.currency || 'BRL')} (Escrow). You can start the job "${job.title}".`,
          type: 'success',
          link: `/jobs/${job.id}`,
        })
      }

      setIsProcessing(false)
      navigate('/payment/success')
    } else {
      setIsProcessing(false)
      toast({
        variant: 'destructive',
        title: 'Payment error',
        description: 'Não foi possível processar a fatura. Tente novamente.',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('checkout.secure', 'Checkout Seguro')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t(
            'payment.finalize_desc',
            'Revise as informações e finalize o pagamento para iniciar o trabalho.',
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('checkout.payment_method', 'Método de Pagamento')}
              </CardTitle>
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
                    <CreditCard className="h-5 w-5 text-blue-600" />{' '}
                    {t('checkout.cc', 'Cartão de Crédito')}
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'credit-card' && (
                <div className="mt-6 p-4 bg-muted/30 border border-dashed rounded-lg text-sm text-center text-muted-foreground">
                  {t(
                    'payment.simulation_cc',
                    'Modo Simulação Ativo. Nenhuma cobrança real será processada no seu cartão neste ambiente.',
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <Lock className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="leading-relaxed">
              {t(
                'payment.protected_desc',
                'Seu pagamento fica protegido em custódia (Escrow) e só será liberado ao profissional após a sua aprovação final do serviço executado.',
              )}
            </p>
          </div>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader className="bg-muted/10 border-b">
              <CardTitle>
                {t('payment.order_summary', 'Resumo do Pedido')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('payment.service', 'Serviço Contratado')}
                </p>
                <p className="font-semibold text-[15px]">{job.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('payment.professional', 'Profissional / Empresa')}
                </p>
                <p className="font-semibold text-[15px]">{receiverName}</p>
              </div>
              <div className="border-t pt-5 mt-2 flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('checkout.total', 'Total a Pagar')}
                </span>
                <span className="text-3xl font-bold text-primary tracking-tight">
                  {formatCurrencyValue(amount, job.currency || 'BRL')}
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
                    {t('checkout.processing', 'Processando Fatura...')}
                  </>
                ) : (
                  <>{t('payment.pay_hire', 'Pagar e Contratar')}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
