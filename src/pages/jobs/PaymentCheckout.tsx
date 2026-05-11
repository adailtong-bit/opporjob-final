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

export default function PaymentCheckout() {
  const { jobId, bidId } = useParams<{ jobId: string; bidId: string }>()
  const navigate = useNavigate()
  const { getJob, acceptBid } = useJobStore()
  const { user } = useAuthStore()
  const { createInvoice } = useInvoices(user?.id)
  const { addNotification } = useNotificationStore()
  const { toast } = useToast()
  const { t, formatCurrency } = useLanguageStore()

  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)

  const job = getJob(jobId!)

  // Logic to determine amount and receiver
  const bid =
    bidId && bidId !== 'fixed' ? job?.bids.find((b) => b.id === bidId) : null

  const amount = bid ? bid.amount : job?.budget || 0
  const receiverName = bid ? bid.executorName : 'Professional (TBD)'
  const receiverId = bid ? bid.executorId : 'pending'

  if (!job || !user) return <div className="p-8">Invalid data</div>

  const handlePayment = async () => {
    setIsProcessing(true)

    const success = await createInvoice({
      job_id: job.id,
      payer_id: user.id,
      receiver_id: receiverId !== 'pending' ? receiverId : undefined,
      amount: amount,
      description: job.title,
      status: 'escrow',
    })

    if (success) {
      // Logic to finalize the job status
      if (bid) {
        acceptBid(job.id, bid.id)

        // Notify Executor
        addNotification({
          userId: bid.executorId,
          title: 'Proposal Accepted & Paid!',
          message: `The contractor paid ${formatCurrency(amount)} (Escrow). You can start the job "${job.title}".`,
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
        description: 'Please try again.',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('checkout.secure')}
        </h1>
        <p className="text-muted-foreground">{t('payment.finalize_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.payment_method')}</CardTitle>
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
                    className="flex items-center gap-2 cursor-pointer w-full"
                  >
                    <CreditCard className="h-5 w-5" /> {t('checkout.cc')}
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'credit-card' && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-center text-muted-foreground">
                  {t('payment.simulation_cc')}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-100">
            <Lock className="h-4 w-4 text-blue-600" />
            <p>{t('payment.protected_desc')}</p>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('payment.order_summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('payment.service')}
                </p>
                <p className="font-semibold">{job.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('payment.professional')}
                </p>
                <p className="font-semibold">{receiverName}</p>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold">{t('checkout.total')}</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(amount)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    {t('checkout.processing')}
                  </>
                ) : (
                  <>{t('payment.pay_hire')}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
