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
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function AdvertiserModal({
  open,
  onOpenChange,
  advertiser,
  onSave,
}: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    tax_id: '',
    website: '',
    name: '',
    job_title: '',
    phone: '',
    email: '',
    financial_email: '',
    pix_key: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    if (advertiser) {
      setFormData({
        company_name: advertiser.company_name || '',
        tax_id: advertiser.tax_id || advertiser.document || '',
        website: advertiser.website || '',
        name: advertiser.name || '',
        job_title: advertiser.job_title || '',
        phone: advertiser.phone || '',
        email: advertiser.email || '',
        financial_email: advertiser.financial_email || '',
        pix_key: advertiser.pix_key || '',
        zip_code: advertiser.zip_code || '',
        street: advertiser.street || '',
        number: advertiser.number || '',
        neighborhood: advertiser.neighborhood || '',
        city: advertiser.city || '',
        state: advertiser.state || '',
      })
    } else {
      setFormData({
        company_name: '',
        tax_id: '',
        website: '',
        name: '',
        job_title: '',
        phone: '',
        email: '',
        financial_email: '',
        pix_key: '',
        zip_code: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      })
    }
  }, [advertiser])

  const handleSave = async () => {
    setLoading(true)

    const payload = {
      company_name: formData.company_name,
      tax_id: formData.tax_id,
      document: formData.tax_id,
      website: formData.website,
      name: formData.name,
      job_title: formData.job_title,
      phone: formData.phone,
      email: formData.email,
      financial_email: formData.financial_email,
      pix_key: formData.pix_key,
      zip_code: formData.zip_code,
      street: formData.street,
      number: formData.number,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      status: advertiser?.status || 'active',
    }

    let error
    if (advertiser?.id) {
      const res = await supabase
        .from('vendors')
        .update(payload)
        .eq('id', advertiser.id)
      error = res.error
    } else {
      const res = await supabase.from('vendors').insert([payload])
      error = res.error
    }

    if (error) {
      toast({
        title: 'Error saving advertiser',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Advertiser saved successfully' })
      onSave()
      onOpenChange(false)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {advertiser ? 'Edit Advertiser' : 'Add Advertiser'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {/* Business Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name (Razão Social)</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID / CNPJ</Label>
                  <Input
                    value={formData.tax_id}
                    onChange={(e) =>
                      setFormData({ ...formData, tax_id: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Contact Person Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Title / Cargo</Label>
                  <Input
                    value={formData.job_title}
                    onChange={(e) =>
                      setFormData({ ...formData, job_title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Financial/Billing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Financial & Billing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Financial Email (for Invoices)</Label>
                  <Input
                    type="email"
                    value={formData.financial_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        financial_email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>PIX Key</Label>
                  <Input
                    value={formData.pix_key}
                    onChange={(e) =>
                      setFormData({ ...formData, pix_key: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Addressing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Addressing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ZIP Code (CEP)</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData({ ...formData, zip_code: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Street (Logradouro)</Label>
                  <Input
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number (Número)</Label>
                  <Input
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Neighborhood (Bairro)</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) =>
                      setFormData({ ...formData, neighborhood: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>City (Cidade)</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>State (Estado)</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
