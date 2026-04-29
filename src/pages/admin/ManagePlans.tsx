import { useState } from 'react'
import {
  useAdminPricingStore,
  SubscriptionPlan,
} from '@/stores/useAdminPricingStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ManagePlans() {
  const { plans, addPlan, updatePlan, deletePlan, togglePlanStatus } =
    useAdminPricingStore()
  const { toast } = useToast()
  const { formatCurrency, t } = useLanguageStore()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({})
  const [features, setFeatures] = useState<string[]>([])

  const regularPlans = plans.filter((p) => p.targetAudience !== 'contractor')

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEditForm({ ...plan })
    setFeatures([...(plan.features || [])])
    setIsEditOpen(true)
  }

  const openAdd = () => {
    setEditingId(null)
    setEditForm({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      validityDays: 30,
      active: true,
      targetAudience: 'executor',
      pushEnabled: false,
      priorityWeight: 1,
      earlyAccessHours: 0,
      visibilityBoost: 1,
      skillMatchingRule: 'strict',
      skillWeight: 1,
    })
    setFeatures([''])
    setIsEditOpen(true)
  }

  const saveEdit = () => {
    if (
      !editForm.name ||
      editForm.price === undefined ||
      !editForm.targetAudience ||
      !['executor', 'advertiser', 'contractor'].includes(
        editForm.targetAudience,
      ) ||
      !editForm.billingCycle ||
      !editForm.validityDays
    ) {
      toast({
        variant: 'destructive',
        title: 'Preencha todos os campos obrigatórios.',
      })
      return
    }

    const planData = {
      ...editForm,
      features: features.filter((f) => f.trim() !== ''),
    } as Omit<SubscriptionPlan, 'id'>

    if (editingId) {
      updatePlan(editingId, planData)
      toast({ title: 'Plano atualizado com sucesso!' })
    } else {
      addPlan(planData)
      toast({ title: 'Plano criado com sucesso!' })
    }
    setIsEditOpen(false)
  }

  const updateFeature = (idx: number, val: string) => {
    const newF = [...features]
    newF[idx] = val
    setFeatures(newF)
  }

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx))
  }

  const getAudienceLabel = (val: string) => {
    if (val === 'executor') return 'Executor'
    if (val === 'advertiser') return 'Anunciante'
    if (val === 'contractor') return 'Contratante'
    return val
  }

  const getCycleLabel = (val: string) => {
    if (val === 'monthly') return 'Mensal'
    if (val === 'quarterly') return 'Trimestral'
    if (val === 'semi-annually') return 'Semestral'
    if (val === 'yearly') return 'Anual'
    return val
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.plans.title')}
        </h1>
        <p className="text-muted-foreground">{t('admin.plans.desc')}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('admin.plans.registered')}</CardTitle>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.plans.new')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Plano</TableHead>
                <TableHead>Público-Alvo</TableHead>
                <TableHead>Preço / Ciclo</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regularPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className={!plan.active ? 'opacity-60' : ''}
                >
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getAudienceLabel(plan.targetAudience)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(plan.price)} (
                    {getCycleLabel(plan.billingCycle)})
                  </TableCell>
                  <TableCell>{plan.validityDays} dias</TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.active}
                      onCheckedChange={() => togglePlanStatus(plan.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(plan)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {regularPlans.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum plano cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          <div className="px-6 py-4 border-b">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Plano' : 'Criar Novo Plano'}
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

            <ScrollArea className="flex-1 h-full">
              <div className="px-6 py-4">
                <TabsContent value="basic" className="space-y-6 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Nome do Plano{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={editForm.name || undefined}
                        onValueChange={(val: string) =>
                          setEditForm({ ...editForm, name: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Básico">Básico</SelectItem>
                          <SelectItem value="Bronze">Bronze</SelectItem>
                          <SelectItem value="Prata">Prata</SelectItem>
                          <SelectItem value="Ouro">Ouro</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Público-Alvo <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          editForm.targetAudience &&
                          ['executor', 'advertiser', 'contractor'].includes(
                            editForm.targetAudience,
                          )
                            ? editForm.targetAudience
                            : undefined
                        }
                        onValueChange={(val: any) =>
                          setEditForm({ ...editForm, targetAudience: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="advertiser">Anunciante</SelectItem>
                          <SelectItem value="executor">Executor</SelectItem>
                          <SelectItem value="contractor">
                            Contratante
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      value={editForm.description || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Breve descrição..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Preço (R$) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={editForm.price ?? 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Ciclo <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={editForm.billingCycle}
                        onValueChange={(val: any) =>
                          setEditForm({ ...editForm, billingCycle: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="semi-annually">
                            Semestral
                          </SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Validade (Dias){' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={editForm.validityDays ?? 30}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            validityDays: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      Benefícios Inclusos
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeatures([...features, ''])}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                      </Button>
                    </Label>
                    <div className="space-y-2">
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={feat}
                            onChange={(e) => updateFeature(idx, e.target.value)}
                            placeholder="Ex: Anúncios ilimitados"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeFeature(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {features.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          Nenhum benefício adicionado.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border p-3 rounded-lg">
                    <Switch
                      id="active"
                      checked={editForm.active}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, active: checked })
                      }
                    />
                    <Label htmlFor="active" className="cursor-pointer">
                      Plano Ativo (Visível na loja)
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-6 mt-0">
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-1">
                      {editForm.targetAudience === 'executor'
                        ? 'Prioridade e Visibilidade do Executor'
                        : editForm.targetAudience === 'advertiser'
                          ? 'Prioridade e Visibilidade do Anunciante'
                          : 'Regras de Acesso'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure os privilégios na plataforma baseados neste
                      nível de plano.
                    </p>

                    {editForm.targetAudience === 'executor' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Peso de Prioridade (Ex: 1 a 100)</Label>
                            <Input
                              type="number"
                              value={editForm.priorityWeight ?? 1}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  priorityWeight: Number(e.target.value),
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              O peso define a ordem em listas de recomendação.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Acesso Antecipado / Antecedência (Horas)
                            </Label>
                            <Input
                              type="number"
                              value={editForm.earlyAccessHours ?? 0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  earlyAccessHours: Number(e.target.value),
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Tempo de acesso exclusivo antes de usuários Básico
                              (Ex: 24h).
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 border-t pt-4">
                          <Label className="text-base">
                            Lógica de Match por Habilidade
                          </Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Defina como as habilidades do executor interagem com
                            os requisitos do solicitante.
                          </p>
                          <Select
                            value={editForm.skillMatchingRule || 'flexible'}
                            onValueChange={(val: any) =>
                              setEditForm({
                                ...editForm,
                                skillMatchingRule: val,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strict">
                                Estrito (Exige match exato de nível)
                              </SelectItem>
                              <SelectItem value="flexible">
                                Flexível (Permite 1 nível de diferença)
                              </SelectItem>
                              <SelectItem value="all">
                                Acesso Total (Ignora bloqueio de nível)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Peso da Habilidade (Skill Weight) [1 a 10]
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={editForm.skillWeight ?? 1}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                skillWeight: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Fator multiplicador usado para rankear executors
                            baseado nas habilidades.
                          </p>
                        </div>
                      </div>
                    )}

                    {editForm.targetAudience === 'advertiser' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label>
                            Boost de Visibilidade dos Anúncios (Ex: 1 a 100)
                          </Label>
                          <Input
                            type="number"
                            value={editForm.visibilityBoost ?? 1}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                visibilityBoost: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Anúncios criados por assinantes deste plano
                            aparecerão primeiro nas listagens.
                          </p>
                        </div>
                      </div>
                    )}

                    {!editForm.targetAudience && (
                      <p className="text-sm text-muted-foreground">
                        Selecione um Público-Alvo na aba de Dados Básicos para
                        visualizar as regras.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 mt-0">
                  <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                    <h3 className="text-lg font-medium mb-1">
                      Comunicações Automatizadas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure alertas push específicos para os assinantes
                      deste plano.
                    </p>

                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-background">
                      <Switch
                        id="pushEnabled"
                        checked={editForm.pushEnabled ?? false}
                        onCheckedChange={(checked) =>
                          setEditForm({ ...editForm, pushEnabled: checked })
                        }
                      />
                      <Label htmlFor="pushEnabled" className="cursor-pointer">
                        Habilitar Notificações Push Especiais
                      </Label>
                    </div>

                    {editForm.pushEnabled && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label>Antecedência da Notificação (Horas)</Label>
                          <Input
                            type="number"
                            value={editForm.pushLeadTimeHours ?? 24}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                pushLeadTimeHours: Number(e.target.value),
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Tempo em horas para enviar alertas sobre vencimentos
                            ou oportunidades exclusivas.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Texto da Notificação (Template)</Label>
                          <Textarea
                            value={editForm.pushMessageText || ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                pushMessageText: e.target.value,
                              })
                            }
                            placeholder="Ex: Aproveite seu acesso antecipado às vagas recém-publicadas!"
                            className="min-h-[100px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            Conteúdo personalizado que será enviado via Push
                            Notification para este nível.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <div className="px-6 py-4 border-t bg-muted/10">
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveEdit}>Salvar Plano</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )