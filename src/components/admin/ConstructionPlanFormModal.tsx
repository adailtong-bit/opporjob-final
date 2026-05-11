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
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { X, Plus } from 'lucide-react'

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

  const [newFeature, setNewFeature] = useState('')

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

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      })
      setNewFeature('')
    }
  }

  const removeFeature = (idx: number) => {
    if (formData.features) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== idx),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            {planToEdit ? 'Editar Plano' : 'Novo Plano'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Plano Profissional"
                />
              </div>
              <div className="space-y-2">
                <Label>Público Alvo</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(v) =>
                    setFormData({ ...formData, targetAudience: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">
                      Profissional / Contratado
                    </SelectItem>
                    <SelectItem value="employer">
                      Cliente / Contratante
                    </SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição resumida do que o plano oferece."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Preço (Valor Base)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ciclo de Cobrança</Label>
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
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="semi-annually">Semestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Limite de Projetos</Label>
                <Input
                  type="number"
                  value={formData.maxProjects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxProjects: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Porte da Obra</Label>
                <Select
                  value={formData.workSize}
                  onValueChange={(v) =>
                    setFormData({ ...formData, workSize: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequena">Pequena</SelectItem>
                    <SelectItem value="Media">Média</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Complexidade</Label>
                <Select
                  value={formData.complexity}
                  onValueChange={(v) =>
                    setFormData({ ...formData, complexity: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Baixa</SelectItem>
                    <SelectItem value="Medium">Média</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Funcionalidades Inclusas</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ex: Emissão de faturas ilimitada"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2 mt-4">
                {formData.features?.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted/50 p-2.5 rounded-md text-sm border group"
                  >
                    <span>{feat}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFeature(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!formData.features || formData.features.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 border border-dashed rounded-md">
                    Nenhuma funcionalidade adicionada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {planToEdit ? 'Salvar Alterações' : 'Criar Plano'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
