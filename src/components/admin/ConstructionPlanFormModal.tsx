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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    currency: 'USD',
    billingCycle: 'monthly',
    maxProjects: 1,
    workSize: 'Pequena',
    complexity: 'Low',
    features: [],
    targetAudience: 'provider',
    entityType: 'both',
    validityDays: 30,
    pushEnabled: false,
    priorityWeight: 1,
    earlyAccessHours: 0,
    visibilityBoost: 1,
    skillMatchingRule: 'strict',
    skillWeight: 1,
    popular: false,
  })

  const [newFeature, setFeature] = useState('')

  useEffect(() => {
    if (planToEdit) {
      setFormData(planToEdit)
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        maxProjects: 1,
        workSize: 'Pequena',
        complexity: 'Low',
        features: [],
        targetAudience: 'provider',
        entityType: 'both',
        validityDays: 30,
        pushEnabled: false,
        priorityWeight: 1,
        earlyAccessHours: 0,
        visibilityBoost: 1,
        skillMatchingRule: 'flexible',
        skillWeight: 1,
        popular: false,
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
      setFeature('')
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
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle>
              {planToEdit ? 'Editar Plano Unificado' : 'Novo Plano Unificado'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs
          defaultValue="basic"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="rules">Regras e Prioridades</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6 h-full">
            <TabsContent value="basic" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Plano</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Profissional / Gold"
                  />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço e Moeda</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.currency || 'USD'}
                      onValueChange={(v) =>
                        setFormData({ ...formData, currency: v })
                      }
                    >
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      className="flex-1"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
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
                  <Label>Validade (Dias)</Label>
                  <Input
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        validityDays: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    onChange={(e) => setFeature(e.target.value)}
                    placeholder="Ex: Emissão de faturas ilimitada"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addFeature}
                  >
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

              <div className="flex gap-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={formData.popular}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, popular: checked })
                    }
                  />
                  <Label htmlFor="popular" className="cursor-pointer">
                    Destaque "Popular"
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active !== false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Plano Ativo na Loja
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6 mt-0">
              <div className="bg-muted/30 p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-1">
                  Regras de Acesso e Prioridade
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure os privilégios baseados no perfil e entidade.
                </p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="provider">
                            Prestador (Service Provider)
                          </SelectItem>
                          <SelectItem value="advertiser">
                            Anunciante (Advertiser)
                          </SelectItem>
                          <SelectItem value="both">Ambos (Global)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Entidade</Label>
                      <Select
                        value={formData.entityType || 'both'}
                        onValueChange={(v) =>
                          setFormData({ ...formData, entityType: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pf">Pessoa Física (PF)</SelectItem>
                          <SelectItem value="pj">
                            Pessoa Jurídica (PJ)
                          </SelectItem>
                          <SelectItem value="both">Ambos (Global)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Acesso Antecipado a Vagas (Horas)</Label>
                      <Input
                        type="number"
                        value={formData.earlyAccessHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            earlyAccessHours: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso de Prioridade (Busca e Listagem)</Label>
                      <Input
                        type="number"
                        value={formData.priorityWeight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priorityWeight: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Impulso de Visibilidade (Anúncios)</Label>
                      <Input
                        type="number"
                        value={formData.visibilityBoost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visibilityBoost: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lógica de Match por Habilidade</Label>
                      <Select
                        value={formData.skillMatchingRule || 'flexible'}
                        onValueChange={(val) =>
                          setFormData({ ...formData, skillMatchingRule: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Estrito</SelectItem>
                          <SelectItem value="flexible">Flexível</SelectItem>
                          <SelectItem value="all">Acesso Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                <h3 className="text-lg font-medium mb-1">
                  Comunicações Automatizadas
                </h3>
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-background">
                  <Switch
                    id="pushEnabled"
                    checked={formData.pushEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, pushEnabled: checked })
                    }
                  />
                  <Label htmlFor="pushEnabled" className="cursor-pointer">
                    Habilitar Notificações Push Especiais (Leads)
                  </Label>
                </div>

                {formData.pushEnabled && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Antecedência da Notificação (Horas)</Label>
                      <Input
                        type="number"
                        value={formData.pushLeadTimeHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pushLeadTimeHours: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Texto da Mensagem Push (Template)</Label>
                      <Textarea
                        value={formData.pushMessageText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pushMessageText: e.target.value,
                          })
                        }
                        placeholder="Ex: Aproveite seu acesso antecipado às vagas recém-publicadas!"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
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
