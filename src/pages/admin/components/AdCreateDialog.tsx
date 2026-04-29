import { useState, useMemo, useEffect } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdStore } from '@/stores/useAdStore'
import { usePricingMatrixStore } from '@/stores/usePricingMatrixStore'
import { useToast } from '@/hooks/use-toast'
import { differenceInDays } from 'date-fns'

export default function AdCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { addAd } = useAdStore()
  const { rules, calculatePrice } = usePricingMatrixStore()
  const { toast } = useToast()

  const [form, setForm] = useState({
    advertiserName: '',
    legalAddress: '',
    taxId: '',
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    adContactName: '',
    adContactEmail: '',
    adContactPhone: '',
    title: '',
    category: 'Construction',
    region: 'BR',
    planLevel: 'Bronze',
    startDate: '',
    endDate: '',
    imageUrl: '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        advertiserName: '',
        legalAddress: '',
        taxId: '',
        billingName: '',
        billingEmail: '',
        billingPhone: '',
        adContactName: '',
        adContactEmail: '',
        adContactPhone: '',
        title: '',
        category: 'Construction',
        region: 'BR',
        planLevel: 'Bronze',
        startDate: '',
        endDate: '',
        imageUrl: '',
      })
    }
  }, [open])

  const price = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0
    const days = differenceInDays(
      new Date(form.endDate),
      new Date(form.startDate),
    )
    if (days <= 0) return 0
    return calculatePrice(form.planLevel, form.region, form.category, days)
  }, [form, calculatePrice])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setForm((p) => ({ ...p, imageUrl: URL.createObjectURL(file) }))
  }

  const handleSubmit = () => {
    if (!form.advertiserName || !form.startDate || !form.endDate || !form.title)
      return
    addAd({
      title: form.title,
      advertiserName: form.advertiserName,
      advertiserDetails: {
        legalAddress: form.legalAddress,
        taxId: form.taxId,
        billingContact: {
          name: form.billingName,
          email: form.billingEmail,
          phone: form.billingPhone,
        },
        adContact: {
          name: form.adContactName,
          email: form.adContactEmail,
          phone: form.adContactPhone,
        },
      },
      category: form.category,
      region: form.region,
      country:
        form.region === 'BR' ? 'BR' : form.region === 'US' ? 'US' : 'Other',
      planLevel: form.planLevel,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      calculatedPrice: price,
      status: 'active',
      createdAt: new Date(),
      skillWeight:
        form.planLevel === 'Premium'
          ? 10
          : form.planLevel === 'Gold'
            ? 7
            : form.planLevel === 'Silver'
              ? 4
              : 1,
      views: 0,
      clicks: 0,
      likes: 0,
      dislikes: 0,
      active: true,
      segment: 'all',
      type: 'segmented',
      isConstruction: form.category === 'Construction',
      imageUrl:
        form.imageUrl ||
        `https://img.usecurling.com/p/600/200?q=${form.category.toLowerCase()}`,
    })
    onOpenChange(false)
    toast({
      title: 'Ad Created',
      description: `Initial billing of $${price.toFixed(2)}`,
    })
  }

  const isValid =
    form.advertiserName &&
    form.title &&
    form.startDate &&
    form.endDate &&
    form.billingEmail

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Ad</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="company" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={form.advertiserName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, advertiserName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Legal Address</Label>
              <Input
                value={form.legalAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, legalAddress: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ / Tax ID</Label>
              <Input
                value={form.taxId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, taxId: e.target.value }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent
            value="contacts"
            className="space-y-4 mt-4 h-[250px] overflow-y-auto pr-2"
          >
            <h4 className="font-semibold text-sm border-b pb-1">Billing</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={form.billingName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, billingName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Email*</Label>
                <Input
                  type="email"
                  value={form.billingEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, billingEmail: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Phone</Label>
                <Input
                  value={form.billingPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, billingPhone: e.target.value }))
                  }
                />
              </div>
            </div>
            <h4 className="font-semibold text-sm border-b pb-1 mt-4">
              Marketing
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={form.adContactName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, adContactName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.adContactEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, adContactEmail: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Phone</Label>
                <Input
                  value={form.adContactPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, adContactPhone: e.target.value }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="campaign"
            className="space-y-4 mt-4 h-[250px] overflow-y-auto pr-2"
          >
            <div className="space-y-2">
              <Label>Campaign Title*</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(rules.categoryMultipliers).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={form.region}
                  onValueChange={(v) => setForm((p) => ({ ...p, region: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(rules.regionMultipliers).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={form.planLevel}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, planLevel: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(rules.siteLevels).map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cost</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-primary font-bold">
                  $ {price.toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Start*</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End*</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Image (JPG, PNG)</Label>
              <Input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />
            </div>
            {form.imageUrl && (
              <div className="mt-4 border rounded-md p-2 flex justify-center bg-muted/50">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="max-h-[160px] object-contain rounded"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={!isValid}>
            Create Ad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
