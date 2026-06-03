import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  useProjectStore,
  DEFAULT_STAGES_TEMPLATE,
  Stage,
} from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Loader2,
  Calendar as CalendarIcon,
  MapPin,
  Globe,
  CreditCard,
} from 'lucide-react'
import { addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CurrencyInput } from '@/components/CurrencyInput'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function NewProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [hasActivePlan, setHasActivePlan] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const { addProject } = useProjectStore()
  const { toast } = useToast()
  const { formatDate, t, language } = useLanguageStore()

  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: 'BR' as 'BR' | 'US',
    startDate: new Date(),
    endDate: addDays(new Date(), 180),
    totalBudget: 0,
    purchaseApprovalThreshold: 1000,
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  })

  useEffect(() => {
    supabase
      .from('construction_plans')
      .select('*')
      .eq('active', true)
      .then(({ data }) => {
        if (data) setPlans(data)
      })
  }, [])

  useEffect(() => {
    async function verifySession() {
      const sessionId = searchParams.get('session_id')
      if (sessionId && user) {
        setVerifyingPayment(true)
        try {
          const { data } = await supabase.functions.invoke(
            'process-plan-payment',
            {
              body: { action: 'verify_checkout', sessionId },
            },
          )
          if (data?.success) {
            toast({ title: t('proj.new.payment_success') })
            const saved = localStorage.getItem('pending_new_project')
            if (saved) {
              addProject(JSON.parse(saved))
              localStorage.removeItem('pending_new_project')
            }
            navigate('/construction/dashboard')
            return
          } else {
            toast({
              variant: 'destructive',
              title: t('proj.new.payment_failed'),
            })
          }
        } catch (e) {
          console.error(e)
          toast({ variant: 'destructive', title: t('proj.new.payment_failed') })
        } finally {
          setVerifyingPayment(false)
          setSearchParams(new URLSearchParams())
        }
      }
    }
    verifySession()
  }, [searchParams, user, navigate, addProject, toast, t, setSearchParams])

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setCheckingAccess(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      const isAdmin =
        profile?.is_admin ||
        user.email === 'adailtong@gmail.com' ||
        user.email?.includes('admin')

      if (isAdmin) {
        setHasActivePlan(true)
        setCheckingAccess(false)
        return
      }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data } = await supabase
        .from('invoices')
        .select('id, status, created_at')
        .eq('payer_id', user.id)
        .eq('type', 'plan_subscription')
        .eq('status', 'paid')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        setHasActivePlan(true)
      } else {
        setHasActivePlan(false)
      }
      setCheckingAccess(false)
    }

    if (!searchParams.get('session_id')) {
      checkAccess()
    }
  }, [user, searchParams])

  const handleAddressChange = (
    field: keyof typeof formData.address,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.address.city || !formData.address.state) {
      toast({
        variant: 'destructive',
        title: t('proj.new.req_title'),
        description: t('proj.new.req_desc'),
      })
      return
    }

    if (!hasActivePlan && !selectedPlanId) {
      toast({
        variant: 'destructive',
        title: t('val.required'),
        description: t('proj.new.select_plan'),
      })
      return
    }

    setLoading(true)

    const stages: Stage[] = DEFAULT_STAGES_TEMPLATE.map((t, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: t.name,
      description: t.description,
      status: idx === 0 ? 'in_progress' : 'pending',
      startDate: addDays(formData.startDate, idx * 30),
      endDate: addDays(formData.startDate, (idx + 1) * 30),
      budgetMaterial: 0,
      budgetLabor: 0,
      actualMaterial: 0,
      actualLabor: 0,
      bimFiles: [],
      progress: 0,
      subStages: [],
    }))

    const formattedLocation = `${formData.address.city} - ${formData.address.state}`

    const brInspections = [
      'Vistoria de Bombeiros',
      'Vigilância Sanitária',
      'Inspeção Bancária (Caixa)',
    ]
    const usInspections = [
      'Footing',
      'Framing',
      'Rough-in (Electric/Plumbing)',
      'Insulation',
      'Drywall',
      'Final Inspection',
    ]

    const defaultInspections = (
      formData.region === 'US' ? usInspections : brInspections
    ).map((name) => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      status: 'pending' as const,
      evidenceUrls: [],
    }))

    const projectData = {
      name: formData.name,
      description: formData.description,
      region: formData.region,
      location: formattedLocation,
      address: formData.address,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalBudget: formData.totalBudget,
      purchaseApprovalThreshold: formData.purchaseApprovalThreshold,
      ownerId: user?.id || 'current-user-id',
      status: 'planning' as const,
      stages,
      inspections: defaultInspections,
      dailyLogs: [],
    }

    if (!hasActivePlan) {
      const selectedPlan = plans.find((p) => p.id === selectedPlanId)
      if (!selectedPlan) {
        setLoading(false)
        return
      }

      localStorage.setItem('pending_new_project', JSON.stringify(projectData))

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          amount: selectedPlan.price,
          payer_id: user!.id,
          type: 'plan_subscription',
          status: 'pending',
          description: `Plan: ${selectedPlan.name}`,
          currency: formData.region === 'US' ? 'USD' : 'BRL',
        })
        .select()
        .single()

      if (error || !invoice) {
        setLoading(false)
        toast({ variant: 'destructive', title: t('error') })
        return
      }

      const { data } = await supabase.functions.invoke('process-plan-payment', {
        body: {
          action: 'create_checkout',
          invoiceId: invoice.id,
          returnUrl: window.location.href.split('?')[0],
        },
      })

      if (data?.url) {
        window.location.href = data.url
        return
      } else {
        setLoading(false)
        toast({ variant: 'destructive', title: t('error') })
        return
      }
    } else {
      addProject(projectData)
      setLoading(false)
      toast({
        title: t('proj.new.success_title'),
        description: t('proj.new.success_desc'),
      })
      navigate('/construction/dashboard')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    let locale = 'en-US'
    if (language === 'pt') locale = 'pt-BR'
    if (language === 'es') locale = 'es-ES'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (checkingAccess || verifyingPayment) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">
          {verifyingPayment ? t('proj.new.verifying_payment') : t('loading')}
        </span>
      </div>
    )
  }

  const selectedPlanData = plans.find((p) => p.id === selectedPlanId)

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('proj.new.title')}
          </h1>
          <p className="text-muted-foreground">{t('proj.new.subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('proj.new.main_data')}</CardTitle>
          <CardDescription>{t('proj.new.main_data_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">{t('proj.new.project_name')}</Label>
                <Input
                  id="name"
                  placeholder={t('proj.new.name_placeholder')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />{' '}
                  {t('proj.new.region_label')}
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={(val: 'BR' | 'US') =>
                    setFormData({ ...formData, region: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">{t('country.br')}</SelectItem>
                    <SelectItem value="US">{t('country.us_fl')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">
                  {t('proj.new.address_title')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">{t('proj.new.zip_label')}</Label>
                  <Input
                    id="zipCode"
                    placeholder={
                      formData.region === 'BR' ? '00000-000' : '12345'
                    }
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      handleAddressChange('zipCode', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">{t('proj.new.street_label')}</Label>
                  <Input
                    id="street"
                    placeholder={t('proj.new.street_placeholder')}
                    value={formData.address.street}
                    onChange={(e) =>
                      handleAddressChange('street', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">{t('proj.new.number_label')}</Label>
                  <Input
                    id="number"
                    placeholder="123"
                    value={formData.address.number}
                    onChange={(e) =>
                      handleAddressChange('number', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="complement">
                    {t('proj.new.complement_label')}
                  </Label>
                  <Input
                    id="complement"
                    placeholder={t('proj.new.complement_placeholder')}
                    value={formData.address.complement}
                    onChange={(e) =>
                      handleAddressChange('complement', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">
                    {t('proj.new.neighborhood_label')}
                  </Label>
                  <Input
                    id="neighborhood"
                    placeholder={t('proj.new.neighborhood_label')}
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      handleAddressChange('neighborhood', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('proj.new.city_label')}</Label>
                  <Input
                    id="city"
                    placeholder={t('proj.new.city_label')}
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange('city', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">{t('proj.new.state_label')}</Label>
                  <Input
                    id="state"
                    placeholder={formData.region === 'BR' ? 'SP' : 'FL'}
                    maxLength={2}
                    value={formData.address.state}
                    onChange={(e) =>
                      handleAddressChange('state', e.target.value.toUpperCase())
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('proj.new.start_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        formatDate(formData.startDate, 'PPP')
                      ) : (
                        <span>{t('general.select')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('proj.new.end_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        formatDate(formData.endDate, 'PPP')
                      ) : (
                        <span>{t('general.select')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, endDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">{t('proj.new.budget')}</Label>
                <CurrencyInput
                  id="budget"
                  value={formData.totalBudget}
                  onChange={(value) =>
                    setFormData({ ...formData, totalBudget: value })
                  }
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">{t('proj.new.threshold')}</Label>
                <CurrencyInput
                  id="threshold"
                  value={formData.purchaseApprovalThreshold}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      purchaseApprovalThreshold: value,
                    })
                  }
                  placeholder="1,000.00"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {t('proj.new.threshold_desc')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">{t('proj.new.description')}</Label>
              <Textarea
                id="desc"
                placeholder={t('proj.new.desc_placeholder')}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {!hasActivePlan && (
              <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CreditCard className="h-5 w-5" />
                  <h3>{t('proj.new.select_plan')}</h3>
                </div>
                <div className="space-y-2">
                  <Select
                    value={selectedPlanId}
                    onValueChange={setSelectedPlanId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('proj.new.select_plan')} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} -{' '}
                          {formatCurrency(
                            p.price,
                            formData.region === 'US' ? 'USD' : 'BRL',
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPlanData && (
                  <div className="flex justify-between items-center bg-background p-3 rounded border">
                    <span className="font-medium text-sm text-muted-foreground">
                      {t('proj.new.total_amount')}
                    </span>
                    <span className="font-bold text-lg">
                      {formatCurrency(
                        selectedPlanData.price,
                        formData.region === 'US' ? 'USD' : 'BRL',
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {hasActivePlan ? t('proj.new.submit') : t('proj.new.pay_now')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
