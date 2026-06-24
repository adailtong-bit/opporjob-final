import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, ShieldAlert } from 'lucide-react'
import { SecuritySettings } from './SecuritySettings'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState<any>({
    name: '',
    company_name: '',
    entity_type: 'pf',
    role: 'contractor',
    country: 'United States',
    zip_code: '',
    city: '',
    state: '',
    street: '',
    document: '',
    tax_id: '',
    state_registration: '',
    avatar_url: '',
    is_admin: false,
  })

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data && !error) {
        setProfile({
          ...data,
          entity_type: data.entity_type || 'pf',
          role: data.role || 'contractor',
          country: data.country || 'United States',
          state_registration: data.state_registration || '',
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  const isMasterAdmin =
    profile.is_admin || user?.email === 'adailtong@gmail.com'

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          company_name: profile.company_name,
          entity_type: profile.entity_type,
          role: profile.role,
          country: profile.country,
          zip_code: profile.zip_code,
          city: profile.city,
          state: profile.state,
          street: profile.street,
          document: profile.document,
          tax_id: profile.tax_id,
          state_registration: profile.state_registration,
        })
        .eq('id', user.id)

      if (error) throw error

      toast({ title: 'Settings updated successfully!' })
    } catch (err: any) {
      toast({
        title: 'Error updating settings',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full border-4 border-muted overflow-hidden flex items-center justify-center bg-gray-50 mb-4 shadow-inner">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-300" />
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Click image to change.
                <br />
                Recommended 256x256px.
              </p>
            </CardContent>
          </Card>

          {isMasterAdmin && (
            <Card className="border-primary/30 shadow-md bg-gradient-to-b from-white to-primary/5">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-primary drop-shadow-sm" />
                <h3 className="font-bold text-xl text-foreground">
                  Access Level
                </h3>
                <div className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  Master Admin
                </div>
                <div className="text-sm text-muted-foreground font-medium mt-3 border-t pt-3 w-full">
                  Type:{' '}
                  <span className="uppercase text-foreground font-bold">
                    {profile.entity_type === 'pj' ? 'Company' : 'Individual'}
                  </span>
                  <br />
                  Role:{' '}
                  <span className="text-foreground font-bold capitalize">
                    {profile.role}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your basic details and address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email (Login)</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select
                  value={profile.entity_type}
                  onValueChange={(v) =>
                    setProfile({ ...profile, entity_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Individual (PF)</SelectItem>
                    <SelectItem value="pj">Company (PJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
              {profile.entity_type === 'pf' ? (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profile.name || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF (Document)</Label>
                    <Input
                      value={profile.document || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, document: e.target.value })
                      }
                      placeholder="000.000.000-00"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={profile.company_name || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, company_name: e.target.value })
                      }
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ (Tax ID)</Label>
                    <Input
                      value={profile.tax_id || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, tax_id: e.target.value })
                      }
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>State Registration (Inscrição Estadual)</Label>
                    <Input
                      value={profile.state_registration || ''}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          state_registration: e.target.value,
                        })
                      }
                      placeholder="State Registration Number"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Role</Label>
                <Select
                  value={profile.role}
                  onValueChange={(v) => setProfile({ ...profile, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="executor">Executor</SelectItem>
                    {isMasterAdmin && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={profile.country}
                  onValueChange={(v) => setProfile({ ...profile, country: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ZIP/Postal Code</Label>
                <Input
                  value={profile.zip_code || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, zip_code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={profile.city || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={profile.state || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, state: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                value={profile.street || ''}
                onChange={(e) =>
                  setProfile({ ...profile, street: e.target.value })
                }
                placeholder="123 Main St"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-8"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <SecuritySettings />
        </div>
      </div>
    </div>
  )
}
