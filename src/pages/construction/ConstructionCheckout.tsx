import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConstructionPlansStore } from '@/stores/useConstructionPlansStore'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CreditCard, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ConstructionCheckout() {
  const { planId } = useParams()
  const { plans, fetchPlans } = useConstructionPlansStore()
  const { user, activateConstructionSubscription } = useAuthStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])
  const navigate = useNavigate()
  const { toast } = useToast()
  const { formatCurrency, t } = useLanguageStore()

  const isAdmin = user?.role === 'admin' || user?.isPremium

  const plan = plans.find((p) => p.id === planId)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentType, setPaymentType] = useState('credit')

  if (!plan)
    return (
      <div className="p-10 text-center text-muted-foreground">
        {t('checkout.plan_not_found')}
      </div>
    )

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      if (isAdmin) {
        activateConstructionSubscription({
          limit: plan.maxProjects || 9999,
          price: 0,
        })
        toast({
          title: t('checkout.admin_access'),
          description: t('checkout.admin_access'),
        })
        navigate('/construction/dashboard')
        return
      }

      // 1. Fetch user profile for billing details
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, tax_id')
        .eq('id', user?.id || '')
        .single()

      const billingInfo = profile?.company_name
        ? ` - Faturado para: ${profile.company_name} (Doc: ${profile.tax_id || 'N/A'})`
        : ''

      // 2. Create Invoice
      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          payer_id: user?.id,
          amount: plan.price,
          currency: 'BRL',
          type: 'plan_subscription',
          status: 'pending',
          description: `Assinatura do plano: ${plan.name}${billingInfo}`,
          due_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 3. Call Edge Function to process payment
      const { error: invokeError } = await supabase.functions.invoke(
        'process-plan-payment',
        {
          body: { invoiceId: invoice.id },
        },
      )

      if (invokeError) throw invokeError

      activateConstructionSubscription({
        limit: plan.maxProjects || 9999,
        price: plan.price,
      })

      toast({
        title: t('checkout.sub_confirmed'),
        description: t('checkout.sub_confirmed'),
      })
      navigate('/construction/dashboard')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro no pagamento',
        description: 'Não foi possível processar o pagamento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 px-4 sm:px-6">
      <div className="mb-6 md:mb-8 text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">
          {t('checkout.secure')}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground break-words max-w-lg mx-auto">
          {t('checkout.finalize_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <form onSubmit={handlePayment} id="checkout-form">
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-4">
                <CardTitle className="text-lg md:text-xl break-words">
                  {t('checkout.payment_method')}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm break-words">
                  {t('checkout.secure_info')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4 md:space-y-6">
                <RadioGroup
                  value={paymentType}
                  onValueChange={setPaymentType}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
                >
                  <div className="flex items-center space-x-2 border p-3 md:p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label
                      htmlFor="credit"
                      className="flex items-center gap-2 cursor-pointer w-full text-xs md:text-sm font-medium break-words"
                    >
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0" />{' '}
                      {t('checkout.cc')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 md:p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label
                      htmlFor="debit"
                      className="flex items-center gap-2 cursor-pointer w-full text-xs md:text-sm font-medium break-words"
                    >
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-green-600 shrink-0" />{' '}
                      {t('checkout.dc')}
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-xs md:text-sm">
                      {t('checkout.card_name')}
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="JOHN DOE"
                      className="h-9 md:h-10 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-xs md:text-sm">
                      {t('checkout.card_number')}
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="h-9 md:h-10 text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-xs md:text-sm">
                        {t('checkout.expiry')}
                      </Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        className="h-9 md:h-10 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-xs md:text-sm">
                        {t('checkout.cvv')}
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        maxLength={4}
                        className="h-9 md:h-10 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          <div className="flex items-start md:items-center gap-3 text-xs md:text-sm text-muted-foreground bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0 mt-0.5 md:mt-0" />
            <p className="leading-relaxed break-words">
              {t('checkout.secure_info')}
            </p>
          </div>
        </div>

        <div className="lg:pl-2">
          <Card className="sticky top-6 overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-4">
              <CardTitle className="text-lg md:text-xl break-words">
                {t('checkout.summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground break-words">
                  {t('checkout.selected_plan')}
                </p>
                <p className="font-semibold text-sm md:text-base break-words">
                  {plan.name}
                </p>
                {plan.features && plan.features.length > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc pl-4 mt-2 space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground break-words">
                  {t('checkout.billing')}
                </p>
                <p className="font-medium text-sm md:text-base break-words">
                  {plan.billingCycle === 'monthly'
                    ? t('checkout.monthly')
                    : t('checkout.yearly')}
                </p>
              </div>
              <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="font-bold text-sm md:text-base">
                  {t('checkout.total')}
                </span>
                <span className="text-xl md:text-2xl font-bold text-primary break-all">
                  {isAdmin
                    ? t('checkout.free_admin')
                    : formatCurrency(plan.price)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 md:p-6 pt-0">
              <Button
                form="checkout-form"
                type="submit"
                className="w-full h-10 md:h-12 text-sm md:text-base"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />{' '}
                    {t('checkout.processing')}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4 md:h-5 md:w-5" />{' '}
                    {isAdmin
                      ? t('checkout.admin_access')
                      : t('checkout.confirm_pay')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
