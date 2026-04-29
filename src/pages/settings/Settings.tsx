import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { maskTaxId } from '@/lib/utils'
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
import {
  getCountryValidation,
  CountryCode,
  formatPhone,
  formatZip,
} from '@/lib/validation'
import { SecuritySettings } from './SecuritySettings'
import { ProfilePictureSettings } from './ProfilePictureSettings'

const createSettingsSchema = (country: CountryCode) => {
  const { phone, zip } = getCountryValidation(country)
  return z.object({
    name: z.string().min(2, 'Required'),
    country: z.enum(['BR', 'US']),
    phone: phone,
    entityType: z.enum(['pf', 'pj']),
    role: z.enum(['contractor', 'executor']),
    street: z.string().min(3, 'Required'),
    number:
      country === 'US' ? z.string().optional() : z.string().min(1, 'Required'),
    complement: z.string().optional(),
    neighborhood:
      country === 'US' ? z.string().optional() : z.string().min(2, 'Required'),
    city: z.string().min(2, 'Required'),
    state: z.string().min(2, 'Required'),
    zipCode: zip,
    bank: z.string().optional(),
    agency: z.string().optional(),
    account: z.string().optional(),
    document: z.string().optional(),
  })
}

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [country, setCountry] = useState<CountryCode>('BR')

  const form = useForm({
    resolver: (values, context, options) =>
      zodResolver(createSettingsSchema(country))(values, context, options),
    defaultValues: {
      name: '',
      country: 'BR',
      phone: '',
      entityType: 'pf',
      role: 'contractor',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      bank: '',
      agency: '',
      account: '',
      document: '',
    },
  })

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()
      if (error) throw error
      setProfile(data)
      const c = (data.country as CountryCode) || 'BR'
      setCountry(c)
      form.reset({
        name: data.name || '',
        country: c,
        phone: data.phone ? formatPhone(data.phone, c) : '',
        entityType: data.entity_type || 'pf',
        role: data.role || 'contractor',
        street: data.street || '',
        number: data.number || '',
        complement: data.complement || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip_code ? formatZip(data.zip_code, c) : '',
        bank: data.bank || '',
        agency: data.agency || '',
        account: data.account || '',
        document: data.document || '',
      })
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (data: any) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          country: data.country,
          phone: data.phone,
          entity_type: data.entityType,
          role: data.role,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          bank: data.bank,
          agency: data.agency,
          account: data.account,
          document: data.document,
        })
        .eq('id', user?.id)
      if (error) throw error
      setProfile({ ...profile, ...data, entity_type: data.entityType })
      toast({ title: 'Success', description: 'Profile updated successfully.' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  const role = form.watch('role')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <ProfilePictureSettings
            profile={profile}
            onUpdate={(url) => setProfile({ ...profile, avatar_url: url })}
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your basic details and address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdateProfile)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel>Email (Login)</FormLabel>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name / Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="entityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entity Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pf">
                                Individual (PF)
                              </SelectItem>
                              <SelectItem value="pj">Company (PJ)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="contractor">
                                Contractor
                              </SelectItem>
                              <SelectItem value="executor">Executor</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select
                            onValueChange={(v) => {
                              const newCountry = v as CountryCode
                              setCountry(newCountry)
                              field.onChange(newCountry)

                              const currentPhone = form.getValues('phone')
                              if (currentPhone) {
                                form.setValue(
                                  'phone',
                                  formatPhone(currentPhone, newCountry),
                                )
                              }

                              const currentZip = form.getValues('zipCode')
                              if (currentZip) {
                                form.setValue(
                                  'zipCode',
                                  formatZip(currentZip, newCountry),
                                )
                              }

                              const currentDoc = form.getValues('document')
                              if (currentDoc) {
                                form.setValue(
                                  'document',
                                  maskTaxId(currentDoc, newCountry),
                                )
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BR">Brasil</SelectItem>
                              <SelectItem value="US">United States</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  formatPhone(e.target.value, country),
                                )
                              }
                              maxLength={country === 'BR' ? 15 : 14}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  formatZip(e.target.value, country),
                                )
                              }
                              maxLength={country === 'BR' ? 9 : 10}
                            />
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
                          <FormLabel>City</FormLabel>
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div
                    className={`grid gap-4 ${country === 'US' ? 'grid-cols-1' : 'grid-cols-3'}`}
                  >
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem
                          className={country === 'US' ? '' : 'col-span-2'}
                        >
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {country !== 'US' && (
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {country !== 'US' && (
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Neighborhood</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem
                          className={country === 'US' ? 'col-span-2' : ''}
                        >
                          <FormLabel>Complement</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h4 className="font-medium">Banking Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="agency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="account"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="document"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document/Tax ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  country === 'US'
                                    ? '000-00-0000'
                                    : '000.000.000-00'
                                }
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    maskTaxId(e.target.value, country),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <SecuritySettings />
        </div>
      </div>
    </div>
  )
}
