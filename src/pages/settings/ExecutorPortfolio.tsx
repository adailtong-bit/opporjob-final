import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Trash2, X, Pencil } from 'lucide-react'
import { CurrencyInput } from '@/components/CurrencyInput'
import { useLanguageStore } from '@/stores/useLanguageStore'

export interface PricedService {
  id: string
  name: string
  unit: string
  price: number
}

export function ExecutorPortfolio({
  profile,
  onUpdate,
}: {
  profile: any
  onUpdate: (data: any) => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  const [services, setServices] = useState<PricedService[]>(
    profile?.priced_services || [],
  )
  const [photos, setPhotos] = useState<string[]>(
    profile?.portfolio_photos || [],
  )

  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceUnit, setNewServiceUnit] = useState('')
  const [newServicePrice, setNewServicePrice] = useState(0)
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAddService = () => {
    if (!newServiceName || !newServiceUnit || newServicePrice <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill all service fields with valid values.',
      })
      return
    }
    if (services.length >= 20) {
      toast({
        variant: 'destructive',
        title: 'Limit Reached',
        description: 'You can only add up to 20 services.',
      })
      return
    }

    const newService: PricedService = {
      id: Math.random().toString(36).substring(7),
      name: newServiceName,
      unit: newServiceUnit,
      price: newServicePrice,
    }

    setServices([...services, newService])
    setNewServiceName('')
    setNewServiceUnit('')
    setNewServicePrice(0)
  }

  useEffect(() => {
    if (newServiceName.length > 3) {
      const base = newServiceName.length * 15
      setSuggestedPrice(base)
    } else {
      setSuggestedPrice(null)
    }
  }, [newServiceName])

  const handleEditService = (service: PricedService) => {
    setNewServiceName(service.name)
    setNewServiceUnit(service.unit)
    setNewServicePrice(service.price)
    setServices(services.filter((s) => s.id !== service.id))
  }

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return

      const files = Array.from(e.target.files)
      if (photos.length + files.length > 10) {
        toast({
          variant: 'destructive',
          title: 'Limit Reached',
          description: 'You can only upload up to 10 photos.',
        })
        return
      }

      setUploading(true)

      const newPhotos: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user?.id}/portfolio/${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)
        newPhotos.push(publicUrl)
      }

      setPhotos([...photos, ...newPhotos])
      toast({ title: 'Success', description: 'Photos uploaded successfully.' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error uploading',
        description: error.message,
      })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemovePhoto = (urlToRemove: string) => {
    setPhotos(photos.filter((url) => url !== urlToRemove))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          priced_services: services,
          portfolio_photos: photos,
        })
        .eq('id', user?.id)

      if (error) throw error

      onUpdate({ priced_services: services, portfolio_photos: photos })
      toast({
        title: 'Success',
        description: 'Portfolio and services saved successfully!',
      })
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Photos</CardTitle>
          <CardDescription>
            Upload up to 10 photos showcasing your work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-md overflow-hidden border group"
              >
                <img
                  src={url}
                  alt={`Portfolio ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(url)}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {photos.length < 10 && (
              <div className="relative aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-xs">Add Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {photos.length} / 10 photos uploaded.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priced Services</CardTitle>
          <CardDescription>
            List your common services and basic pricing (up to 20).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/30 p-4 rounded-lg border">
            <div className="md:col-span-5 space-y-2">
              <Label>Service Name</Label>
              <Input
                placeholder="Ex: Tile Installation"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Unit of Measure</Label>
              <Input
                placeholder="Ex: sqft, hr, piece"
                value={newServiceUnit}
                onChange={(e) => setNewServiceUnit(e.target.value)}
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Price</Label>
              <CurrencyInput
                value={newServicePrice}
                onChange={setNewServicePrice}
              />
              {suggestedPrice && (
                <p className="text-[10px] text-blue-600 font-medium mt-1">
                  💡 Sugestão de mercado: {formatCurrency(suggestedPrice)}
                </p>
              )}
            </div>
            <div className="md:col-span-1">
              <Button
                type="button"
                onClick={handleAddService}
                className="w-full"
                disabled={services.length >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {services.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md">
                No services added yet.
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">
                        Service
                      </th>
                      <th className="px-4 py-2 text-left font-medium">Unit</th>
                      <th className="px-4 py-2 text-right font-medium">
                        Price
                      </th>
                      <th className="px-4 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {services.map((service) => (
                      <tr
                        key={service.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">{service.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {service.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(service.price)}
                        </td>
                        <td className="px-4 py-3 flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={() => handleEditService(service)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="text-xs text-muted-foreground text-right">
              {services.length} / 20 services defined.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSaveAll} disabled={saving} size="lg">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Portfolio & Services
        </Button>
      </div>
    </div>
  )
}
