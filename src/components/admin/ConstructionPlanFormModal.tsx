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
import {
  useConstructionPlansStore,
  ConstructionPlan,
} from '@/stores/useConstructionPlansStore'
import { CurrencyInput } from '@/components/CurrencyInput'

export function ConstructionPlanFormModal({
  open,
  onClose,
  planToEdit,
}: {
  open: boolean
  onClose: () => void
  planToEdit: ConstructionPlan | null
}) {
  const { addPlan, updatePlan } = useConstructionPlansStore()

  const [formData, setFormData] = useState<Partial<ConstructionPlan>>({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    maxProjects: 1,
    workSize: 'Pequena',
    complexity: 'Low',
    features: [],
    targetAudience: 'contractor',
  })

  useEffect(() => {
    if (planToEdit) {
      setFormData(planToEdit)
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        maxProjects: 1,
        workSize: 'Pequena',
        complexity: 'Low',
        features: [],
        targetAudience: 'contractor',
      })
    }
  }, [planToEdit, open])

  const handleSubmit = async () => {
    if (planToEdit) {
      await updatePlan(planToEdit.id, formData)
    } else {
      await addPlan(formData)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{planToEdit ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <CurrencyInput
              value={formData.price || 0}
              onChange={(val) => setFormData({ ...formData, price: val })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cycle</Label>
            <Select
              value={formData.billingCycle}
              onValueChange={(v) =>
                setFormData({ ...formData, billingCycle: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Max Projects</Label>
            <Input
              type="number"
              value={formData.maxProjects}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxProjects: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
