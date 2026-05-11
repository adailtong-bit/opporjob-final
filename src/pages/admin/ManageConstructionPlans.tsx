import { useState, useEffect } from 'react'
import {
  useConstructionPlansStore,
  ConstructionPlan,
} from '@/stores/useConstructionPlansStore'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit2, Plus, HardHat, CheckCircle2 } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { ConstructionPlanFormModal } from '@/components/admin/ConstructionPlanFormModal'

export default function ManageConstructionPlans() {
  const { plans, fetchPlans, deletePlan, togglePlanStatus } =
    useConstructionPlansStore()
  const { t, formatCurrency } = useLanguageStore()

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ConstructionPlan | null>(null)

  // Removido o filtro, exibindo a tabela completa do banco de dados (1:1 com a base real)
  const constructionPlans = plans

  const openAdd = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  const openEdit = (plan: ConstructionPlan) => {
    setEditingPlan(plan)
    setIsModalOpen(true)
  }

  const getCycleLabel = (val: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      'semi-annually': 'Semestral',
      yearly: 'Anual',
    }
    return labels[val] || val
  }

  const getAudienceLabel = (val: string) => {
    const labels: Record<string, string> = {
      contractor: 'Profissional',
      employer: 'Cliente',
      both: 'Ambos',
    }
    return labels[val] || val
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HardHat className="h-8 w-8 text-primary" /> Planos de Assinatura
          </h1>
          <p className="text-muted-foreground">
            Gerencie os planos, valores e funcionalidades oferecidos na
            plataforma.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Novo Plano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos Configurados (Sincronizado)</CardTitle>
          <CardDescription>
            Abaixo estão todos os planos registrados. Eles refletem exatamente o
            que os usuários verão.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome e Detalhes</TableHead>
                <TableHead>Público Alvo</TableHead>
                <TableHead>Preço / Ciclo</TableHead>
                <TableHead>Limites e Porte</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {constructionPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className={!plan.active ? 'opacity-60 bg-muted/20' : ''}
                >
                  <TableCell>
                    <div className="font-bold text-base">{plan.name}</div>
                    <div
                      className="text-xs text-muted-foreground mt-1 line-clamp-2"
                      title={plan.description}
                    >
                      {plan.description || 'Sem descrição'}
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <div className="mt-2 text-xs flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3 w-3" />{' '}
                        {plan.features.length} itens inclusos
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {getAudienceLabel(plan.targetAudience)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-[15px]">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {getCycleLabel(plan.billingCycle)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-bold">{plan.maxProjects}</span>{' '}
                      projetos ativos
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Porte: {plan.workSize}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Compl.: {plan.complexity}
                    </div>
                  </TableCell>
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
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (
                          confirm(
                            'Tem certeza que deseja excluir permanentemente este plano?',
                          )
                        )
                          deletePlan(plan.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {constructionPlans.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhum plano configurado no sistema.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConstructionPlanFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planToEdit={editingPlan}
      />
    </div>
  )
}
