import { useEffect, useState } from 'react'
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
import { usePricingMatrixStore } from '@/stores/usePricingMatrixStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useToast } from '@/hooks/use-toast'

export function AdCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addAd } = useAdStore()
  const { vendors, fetchVendors } = useVendorStore()
  const { rules, fetchRules, calculatePrice } = usePricingMatrixStore()
  const { categories, fetchCategories } = useCategoryStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    advertiser_id: '',
    tier: 'Tier 3 (Basic)',
    region: 'Global',
    category: 'General',
    media_url: '',
    target_url: '',
    start_date: '',
    end_date: '',
  })

  const [calculatedPrice, setCalculatedPrice] = useState(0)

  useEffect(() => {
    if (open) {
      fetchVendors()
      fetchRules()
      fetchCategories()
      setFormData({
        title: '',
        advertiser_id: '',
        tier: 'Tier 3 (Basic)',
        region: 'Global',
        category: 'General',
        media_url: '',
        target_url: '',
        start_date: '',
        end_date: '',
      })
    }
  }, [open, fetchVendors, fetchRules, fetchCategories])

  useEffect(() => {
    if (!formData.start_date || !formData.end_date) {
      setCalculatedPrice(0)
      return
    }
    const start = new Date(formData.start_date)
    const end = new Date(formData.end_date)
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
    )

    if (days > 0 && rules) {
      const price = calculatePrice(
        formData.tier,
        formData.region,
        formData.category,
        days,
      )
      setCalculatedPrice(price)
    } else {
      setCalculatedPrice(0)
    }
  }, [
    formData.tier,
    formData.region,
    formData.category,
    formData.start_date,
    formData.end_date,
    rules,
    calculatePrice,
  ])

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.advertiser_id ||
      !formData.start_date ||
      !formData.end_date
    ) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      await addAd({
        title: formData.title,
        advertiser_id: formData.advertiser_id,
        media_url: formData.media_url,
        target_url: formData.target_url,
        status: 'draft',
        tier: formData.tier,
        specifications: {
          region: formData.region,
          category: formData.category,
        },
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        price: calculatedPrice,
      })
      toast({ title: 'Campaign created successfully' })
      onOpenChange(false)
    } catch (error) {
      toast({ title: 'Error creating campaign', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Create Advertising Campaign</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Summer Sale 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Advertiser (Vendor) *</Label>
              <Select
                value={formData.advertiser_id}
                onValueChange={(val) =>
                  setFormData({ ...formData, advertiser_id: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select advertiser" />
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select
                value={formData.tier}
                onValueChange={(val) => setFormData({ ...formData, tier: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(rules?.tiers || {}).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                value={formData.region}
                onValueChange={(val) =>
                  setFormData({ ...formData, region: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(rules?.regions || {}).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Media URL (Image) *</Label>
              <Input
                value={formData.media_url}
                onChange={(e) =>
                  setFormData({ ...formData, media_url: e.target.value })
                }
                placeholder="https://..."
              />
              {formData.media_url && (
                <img
                  src={formData.media_url}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded-md border"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onLoad={(e) => (e.currentTarget.style.display = 'block')}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Target URL (Link)</Label>
              <Input
                value={formData.target_url}
                onChange={(e) =>
                  setFormData({ ...formData, target_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg flex justify-between items-center mt-4">
            <div className="font-medium">Estimated Price</div>
            <div className="text-xl font-bold text-primary">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(calculatedPrice)}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
