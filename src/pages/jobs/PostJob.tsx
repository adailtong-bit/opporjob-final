import React, { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
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
import { Briefcase, MapPin, UploadCloud, X } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { formatPhone, formatZip } from '@/lib/validation'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useJobStore } from '@/stores/useJobStore'
import { CurrencyInput } from '@/components/CurrencyInput'
import { supabase } from '@/lib/supabase/client'

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  subCategory: z.string().optional(),
  listingType: z.enum([
    'product',
    'donation',
    'job',
    'service',
    'rental',
    'desapego',
  ]),
  price: z.number().optional(),
  pricingType: z.string().optional(),
  phone: z.string().optional(),
  zipCode: z.string(),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
})

type JobFormValues = z.infer<typeof baseSchema>

export default function PostJob() {
  const { currentLanguage, t } = useLanguageStore()
  const lang = currentLanguage as 'en' | 'pt' | 'es'
  const countryCode = lang === 'pt' ? 'BR' : 'US'
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { categories } = useCategoryStore()
  const { user } = useAuthStore()
  const { addJob } = useJobStore()

  const jobSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(3, t('val.min_title')),
        description: z.string().min(10, t('val.min_desc')),
        category: z.string().min(1, t('val.req_category')),
        subCategory: z.string().optional(),
        listingType: z.enum([
          'product',
          'donation',
          'job',
          'service',
          'rental',
          'desapego',
        ]),
        price: z.number().optional(),
        pricingType: z.string().optional(),
        phone: z.string().optional(),
        zipCode: z.string().min(5, t('val.invalid_zip')),
        street: z.string().min(2, t('val.req_street')),
        number: z.string().min(1, t('val.req_number')),
        neighborhood: z.string().min(2, t('val.req_neighborhood')),
        city: z.string().min(2, t('val.req_city')),
        state: z.string().min(2, t('val.req_state')),
      }),
    [t],
  )

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subCategory: '',
      listingType: 'service',
      price: 0,
      pricingType: 'fixed',
      phone: '',
      zipCode: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  })

  const watchListingType = form.watch('listingType')
  const watchCategory = form.watch('category')
  const isProductType = ['product', 'desapego'].includes(watchListingType)
  const locationLabel = isProductType
    ? t('post.pickup_address')
    : t('post.activity_location')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZip(e.target.value, countryCode)
    form.setValue('zipCode', formatted, { shouldValidate: true })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value, countryCode)
    form.setValue('phone', formatted, { shouldValidate: true })
  }

  const onSubmit = async (data: JobFormValues) => {
    if (!user) {
      toast({ title: 'Please login to post', variant: 'destructive' })
      navigate('/login')
      return
    }

    setIsSubmitting(true)
    try {
      const uploadedUrls: string[] = []
      if (files.length > 0) {
        for (const file of files) {
          const ext = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from('job-photos').upload(fileName, file)

          if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('job-photos')
              .getPublicUrl(fileName)
            uploadedUrls.push(publicUrlData.publicUrl)
          } else if (uploadError) {
            console.error('Upload error', uploadError)
          }
        }
      }

      const formattedLocation = `${data.street}, ${data.number} - ${data.neighborhood}, ${data.city} - ${data.state}, ${data.zipCode}`

      const payload = {
        title: data.title,
        description: data.description,
        listingType: data.listingType,
        pricingType: data.pricingType || 'fixed',
        category: data.category,
        subCategory: data.subCategory,
        location: formattedLocation,
        budget: data.price || 0,
        ownerId: user.id,
        ownerName: user.name || user.email || 'Visitante',
        photos: uploadedUrls,
      }

      const createdJob = await addJob(payload)

      toast({
        title: t('success'),
        description: t('post.success'),
      })

      if (createdJob) {
        navigate(`/jobs/${createdJob.id}`)
      } else {
        navigate('/my-jobs')
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to post. ' + error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">
                {t('post.section.main')}
              </h3>

              <FormField
                control={form.control}
                name="listingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('job.type')}</FormLabel>
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
                          {t('post.type.product_new')}
                        </SelectItem>
                        <SelectItem value="desapego">
                          {t('post.type.used')}
                        </SelectItem>
                        <SelectItem value="job">
                          {t('post.type.jobs')}
                        </SelectItem>
                        <SelectItem value="service">
                          {t('post.type.services')}
                        </SelectItem>
                        <SelectItem value="rental">
                          {t('post.type.rentals')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-primary/5 p-5 border border-primary/20 rounded-lg">
                <FormField
                  control={form.control}
                  name="pricingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.billing_type')}</FormLabel>
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
                          <SelectItem value="fixed">
                            {t('post.pricing.fixed')}
                          </SelectItem>
                          <SelectItem value="negotiable">
                            {t('post.pricing.negotiable')}
                          </SelectItem>
                          <SelectItem value="hourly">
                            {t('post.pricing.hourly')}
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
                        {watchListingType === 'rental'
                          ? t('post.rental_rate')
                          : isProductType
                            ? t('post.sale_price')
                            : t('post.budget_est')}
                      </FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value || 0}
                          onChange={field.onChange}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('post.ad_title')}</FormLabel>
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
                      <FormLabel>{t('post.category')}</FormLabel>
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
                      <FormLabel>{t('post.subcategory')}</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('post.detailed_desc')}</FormLabel>
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

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">
                {t('post.section.photos')}
              </h3>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium">
                    {t('post.photos.click_to_upload')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('post.photos.format_info')}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                          onClick={() => removeFile(i)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {locationLabel}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.zip')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          {...field}
                          onChange={handleZipChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.street')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.number')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.neighborhood')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.city')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('post.state')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>{t('post.contact_phone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={handlePhoneChange}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('post.submitting') : t('post.submit_ad')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
