import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function NewProject() {
  const navigate = useNavigate()
  const { addProject } = useProjectStore()
  const { toast } = useToast()
  const { formatDate, t } = useLanguageStore()

  const [loading, setLoading] = useState(false)
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

    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create stages based on template
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

    addProject({
      name: formData.name,
      description: formData.description,
      region: formData.region,
      location: formattedLocation,
      address: formData.address,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalBudget: formData.totalBudget,
      purchaseApprovalThreshold: formData.purchaseApprovalThreshold,
      ownerId: 'current-user-id', // Mock ID
      status: 'planning',
      stages,
      inspections: defaultInspections,
      dailyLogs: [],
    })

    setLoading(false)
    toast({
      title: t('proj.new.success_title'),
      description: t('proj.new.success_desc'),
    })
    navigate('/construction/dashboard')
  }

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
                <Label htmlFor="name">{t('proj.new.name_label')}</Label>
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
                  placeholder="R$ 0,00"
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

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <Label className="font-semibold flex items-center gap-2">
                {t('proj.new.workflow', {
                  count: DEFAULT_STAGES_TEMPLATE.length,
                })}
              </Label>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {DEFAULT_STAGES_TEMPLATE.slice(0, 5).map((s, i) => (
                  <li key={i}>{s.name}</li>
                ))}
                <li>
                  {t('proj.new.workflow_more', {
                    count: DEFAULT_STAGES_TEMPLATE.length - 5,
                  })}
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('proj.new.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
