import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdStore } from '@/stores/useAdStore'
import { useVendorStore } from '@/stores/useVendorStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { usePricingMatrixStore } from '@/stores/usePricingMatrixStore'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function AdCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addAd } = useAdStore()
  const { vendors, fetchVendors } = useVendorStore()
  const { categories, fetchCategories } = useCategoryStore()
  const { calculatePrice, fetchRules } = usePricingMatrixStore()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    advertiser_id: '',
    title: '',
    target_url: '',
    media_url: '',
    tier: 'Tier 3 (Basic)',
    category: '',
    start_date: '',
    end_date: '',
    price: 0,
  })

  useEffect(() => {
    if (open) {
      fetchVendors()
      fetchCategories()
      fetchRules()
    }
  }, [open, fetchVendors, fetchCategories, fetchRules])

  useEffect(() => {
    if (
      formData.tier &&
      formData.category &&
      formData.start_date &&
      formData.end_date
    ) {
      const start = new Date(formData.start_date).getTime()
      const end = new Date(formData.end_date).getTime()
      const days = (end - start) / (1000 * 3600 * 24)
      const computed = calculatePrice(
        formData.tier,
        'Global',
        formData.category,
        days > 0 ? days : 30,
      )
      setFormData((prev) => ({ ...prev, price: computed }))
    }
  }, [
    formData.tier,
    formData.category,
    formData.start_date,
    formData.end_date,
    calculatePrice,
  ])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('ads')
      .upload(fileName, file)

    if (error) {
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      })
    } else if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('ads').getPublicUrl(fileName)
      setFormData((prev) => ({ ...prev, media_url: publicUrl }))
      toast({ title: 'Image uploaded successfully' })
    }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!formData.advertiser_id || !formData.title || !formData.category) {
      toast({
        title: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    await addAd({
      ...formData,
      status: 'active',
      specifications: { category: formData.category, region: 'Global' },
    })
    toast({ title: 'Campaign created successfully' })
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advertising Campaign</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2 col-span-2">
            <Label>Advertiser</Label>
            <Select
              value={formData.advertiser_id}
              onValueChange={(v) =>
                setFormData({ ...formData, advertiser_id: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an advertiser" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Campaign Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Target URL</Label>
            <Input
              value={formData.target_url}
              onChange={(e) =>
                setFormData({ ...formData, target_url: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tier</Label>
            <Select
              value={formData.tier}
              onValueChange={(v) => setFormData({ ...formData, tier: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tier 3 (Basic)">Tier 3 (Basic)</SelectItem>
                <SelectItem value="Tier 2 (Standard)">
                  Tier 2 (Standard)
                </SelectItem>
                <SelectItem value="Tier 1 (Premium)">
                  Tier 1 (Premium)
                </SelectItem>
                <SelectItem value="Tier 0 (Enterprise)">
                  Tier 0 (Enterprise)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Media / Banner</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            {formData.media_url && (
              <img
                src={formData.media_url}
                alt="Preview"
                className="h-20 object-cover mt-2 rounded border"
              />
            )}
          </div>
          <div className="space-y-2 col-span-2 pt-4 border-t">
            <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
              <span className="font-semibold text-lg">Calculated Price:</span>
              <span className="font-bold text-2xl text-primary">
                ${formData.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || uploading}>
            Save Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
