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
import { useCategoryStore } from '@/stores/useCategoryStore'

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  subCategory: z.string().min(1, 'Please select a subcategory'),
  type: z.enum(['product', 'donation', 'job', 'service', 'rental']),
  price: z.string().optional(),
  pricingType: z.string().optional(),
  phone: z.string().min(14, 'Phone number must be fully formatted'),
})

type JobFormValues = z.infer<typeof jobSchema>

export default function PostJob() {
  const { currentLanguage, currentCurrency, t } = useLanguageStore()
  const lang = currentLanguage as 'en' | 'pt' | 'es'
  const countryCode = lang === 'pt' ? 'BR' : 'US'
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { categories } = useCategoryStore()

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
                        <SelectItem value="product">
                          {t('post.type.clearance') || 'Desapego'}
                        </SelectItem>
                        <SelectItem value="donation">
                          {t('post.type.donation') || 'Doação'}
                        </SelectItem>
                        <SelectItem value="job">
                          {t('post.type.job') || 'Vagas'}
                        </SelectItem>
                        <SelectItem value="service">
                          {t('post.type.service') || 'Serviços'}
                        </SelectItem>
                        <SelectItem value="rental">
                          {t('post.type.rental') || 'Aluguéis'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {['service', 'job', 'product', 'rental'].includes(watchType) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 border rounded-lg bg-primary/5 animate-fade-in border-primary/20">
                  {['service', 'job'].includes(watchType) && (
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
                                <SelectValue
                                  placeholder={t('general.select')}
                                />
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
                  )}

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchType === 'rental'
                            ? t('post.rental_rate')
                            : watchType === 'product'
                              ? t('post.sale_price')
                              : t('post.budget_est')}{' '}
                          ({currentCurrency || 'USD'})
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
                      <FormLabel>{t('market.category')}</FormLabel>
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
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.translationKey
                                ? t(cat.translationKey)
                                : cat.name}
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
                            categories
                              .find((c) => c.id === watchCategory)
                              ?.subCategories.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.translationKey
                                    ? t(sub.translationKey)
                                    : sub.name}
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
