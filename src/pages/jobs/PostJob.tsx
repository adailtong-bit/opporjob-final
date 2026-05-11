import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Briefcase, DollarSign } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { formatPhone } from '@/lib/validation'

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  subCategory: z.string().min(1, 'Please select a subcategory'),
  type: z.enum(['donation', 'service', 'job']),
  price: z.string().optional(),
  pricingType: z.string().optional(),
  phone: z.string().min(14, 'Phone number must be fully formatted'),
})

type JobFormValues = z.infer<typeof jobSchema>

const CATEGORIES = {
  en: [
    { id: 'construction', name: 'Construction & Remodeling' },
    { id: 'technology', name: 'IT & Technology' },
    { id: 'maintenance', name: 'Home Maintenance' },
  ],
  pt: [
    { id: 'construction', name: 'Construção & Reformas' },
    { id: 'technology', name: 'TI & Tecnologia' },
    { id: 'maintenance', name: 'Manutenção Residencial' },
  ],
  es: [
    { id: 'construction', name: 'Construcción y Reformas' },
    { id: 'technology', name: 'TI y Tecnología' },
    { id: 'maintenance', name: 'Mantenimiento del Hogar' },
  ],
}

const SUBCATEGORIES: Record<string, { en: any[]; pt: any[]; es: any[] }> = {
  construction: {
    en: [
      { id: 'plumbing', name: 'Plumbing' },
      { id: 'electrical', name: 'Electrical' },
      { id: 'painting', name: 'Painting' },
    ],
    pt: [
      { id: 'plumbing', name: 'Encanamento' },
      { id: 'electrical', name: 'Elétrica' },
      { id: 'painting', name: 'Pintura' },
    ],
    es: [
      { id: 'plumbing', name: 'Plomería' },
      { id: 'electrical', name: 'Electricidad' },
      { id: 'painting', name: 'Pintura' },
    ],
  },
  technology: {
    en: [
      { id: 'web', name: 'Web Development' },
      { id: 'support', name: 'Tech Support' },
    ],
    pt: [
      { id: 'web', name: 'Desenvolvimento Web' },
      { id: 'support', name: 'Suporte Técnico' },
    ],
    es: [
      { id: 'web', name: 'Desarrollo Web' },
      { id: 'support', name: 'Soporte Técnico' },
    ],
  },
  maintenance: {
    en: [
      { id: 'cleaning', name: 'House Cleaning' },
      { id: 'landscaping', name: 'Landscaping' },
    ],
    pt: [
      { id: 'cleaning', name: 'Limpeza Residencial' },
      { id: 'landscaping', name: 'Jardinagem' },
    ],
    es: [
      { id: 'cleaning', name: 'Limpieza del Hogar' },
      { id: 'landscaping', name: 'Jardinería' },
    ],
  },
}

export default function PostJob() {
  const { currentLanguage, currentCurrency, t } = useLanguageStore()
  const lang = currentLanguage as 'en' | 'pt' | 'es'
  const countryCode = lang === 'pt' ? 'BR' : lang === 'en' ? 'US' : 'ES'
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subCategory: '',
      type: 'service',
      price: '',
      pricingType: 'fixed',
      phone: '',
    },
  })

  const watchType = form.watch('type')
  const watchCategory = form.watch('category')

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Job Data to save:', data)

      toast({
        title: t('success'),
        description: t('post.success'),
      })
      form.reset({
        ...data,
        title: '',
        description: '',
        price: '',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to post job.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value, countryCode)
    form.setValue('phone', formatted, { shouldValidate: true })
  }

  return (
    <div className="container max-w-3xl py-12 mx-auto px-4 sm:px-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            {t('publish.what')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('post.form.desc')}</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t('job.type')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={t('general.select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="service">
                          {t('post.type.job.label')}
                        </SelectItem>
                        <SelectItem value="job">
                          {t('post.type.job.label')}
                        </SelectItem>
                        <SelectItem value="donation">
                          {t('category.donation')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType === 'service' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 border rounded-lg bg-primary/5 animate-fade-in border-primary/20">
                  <FormField
                    control={form.control}
                    name="pricingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('post.pricing_type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('general.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hourly">
                              {t('post.rate.daily')}
                            </SelectItem>
                            <SelectItem value="fixed">
                              {t('job.fixed_price')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('post.budget_est')} ({currentCurrency || 'BRL'})
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>{t('post.free_help')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="h-px w-full bg-border" />

            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{t('post.basic_info')}</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('post.title_placeholder')}</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        placeholder={t('post.title_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category.ti').split(' ')[0]}</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val)
                          form.setValue('subCategory', '')
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('general.select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(CATEGORIES[lang] || CATEGORIES.pt).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('job.subcategory')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!watchCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('general.select')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {watchCategory &&
                            (
                              SUBCATEGORIES[watchCategory]?.[lang] ||
                              SUBCATEGORIES[watchCategory]?.pt
                            )?.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('job.post.contact')} (Telefone)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={handlePhoneChange}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormDescription>
                      Telefone de contato com DDD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('job.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] resize-y"
                        placeholder={t('post.desc_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('loading') : t('publish.btn')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
