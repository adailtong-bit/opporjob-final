import { useState } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function AdvertisersEditDialog({
  vendor,
  onClose,
  onSave,
}: {
  vendor: any
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: vendor.name || '',
    company_name: vendor.company_name || '',
    tax_id: vendor.tax_id || vendor.document || '',
    financial_email: vendor.financial_email || '',
    email: vendor.email || '',
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('vendors')
      .update({
        name: formData.name,
        company_name: formData.company_name,
        tax_id: formData.tax_id,
        financial_email: formData.financial_email,
        email: formData.email,
        document: formData.tax_id,
      })
      .eq('id', vendor.id)

    setLoading(false)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Advertiser updated successfully.',
      })
      onSave()
    }
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Advertiser</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Contact Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / Document</Label>
            <Input
              id="tax_id"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Primary Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="financial_email">
              Financial Email (for Invoices)
            </Label>
            <Input
              id="financial_email"
              type="email"
              name="financial_email"
              value={formData.financial_email}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
