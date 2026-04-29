import { useState } from 'react'
import {
  useAdminPricingStore,
  SubscriptionPlan,
} from '@/stores/useAdminPricingStore'
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
import { Trash2, Edit2, Plus, HardHat } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { ConstructionPlanFormModal } from '@/components/admin/ConstructionPlanFormModal'

export default function ManageConstructionPlans() {
  const { plans, deletePlan, togglePlanStatus } = useAdminPricingStore()
  const { formatCurrency } = useLanguageStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  const constructionPlans = plans.filter(
    (p) => p.targetAudience === 'contractor',
  )

  const openAdd = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  const openEdit = (plan: SubscriptionPlan) => {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HardHat className="h-8 w-8 text-primary" />{' '}
            {t('admin.cplans.title')}
          </h1>
          <p className="text-muted-foreground">{t('admin.cplans.desc')}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> {t('admin.plans.new')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.cplans.configured')}</CardTitle>
          <CardDescription>{t('admin.cplans.configured_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Plano</TableHead>
                <TableHead>Preço / Ciclo</TableHead>
                <TableHead>Limite Projetos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {constructionPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className={!plan.active ? 'opacity-60' : ''}
                >
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    {formatCurrency(plan.price)} (
                    {getCycleLabel(plan.billingCycle)})
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{plan.maxProjects}</span> obras
                    ativas
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
                      className="text-destructive"
                      onClick={() => {
                        if (confirm('Excluir este plano?')) deletePlan(plan.id)
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
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum plano de obras configurado.
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
