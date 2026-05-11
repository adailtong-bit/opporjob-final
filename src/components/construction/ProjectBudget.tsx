import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Trash2, Plus } from 'lucide-react'
import { CurrencyInput } from '@/components/CurrencyInput'

interface ProjectBudgetProps {
  projectId: string
}

export function ProjectBudget({ projectId }: ProjectBudgetProps) {
  const { getProject, addBudgetItem, removeBudgetItem } = useProjectStore()
  const { t, formatCurrency } = useLanguageStore()
  const project = getProject(projectId)

  const [newItem, setNewItem] = useState({
    description: '',
    category: 'material',
    costClass: 'capex',
    unitCost: 0,
    quantity: 1,
  })

  if (!project) return null

  const handleAddItem = () => {
    if (!newItem.description || newItem.unitCost < 0 || newItem.quantity <= 0)
      return

    addBudgetItem(projectId, {
      description: newItem.description,
      category: newItem.category as any,
      costClass: newItem.costClass as any,
      unitCost: Math.max(0, newItem.unitCost),
      quantity: Math.max(1, newItem.quantity),
      totalCost: Math.max(0, newItem.unitCost) * Math.max(1, newItem.quantity),
    })
    setNewItem({
      description: '',
      category: 'material',
      costClass: 'capex',
      unitCost: 0,
      quantity: 1,
    })
  }

  const budgetItems = project.budgetItems || []
  const totalBudget = budgetItems.reduce((acc, item) => acc + item.totalCost, 0)

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('proj.budget.title')}</CardTitle>
            <CardDescription>{t('proj.budget.desc')}</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground block">
              {t('proj.budget.total')}
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totalBudget)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add Item Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/30 p-4 rounded-lg">
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-medium">
                {t('proj.budget.item')}
              </label>
              <Input
                placeholder={t('proj.budget.placeholder')}
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">Classe (CAPEX/Soft)</label>
              <Select
                value={newItem.costClass}
                onValueChange={(val) =>
                  setNewItem({ ...newItem, costClass: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capex">CAPEX (Obra)</SelectItem>
                  <SelectItem value="soft_cost">Soft Cost (Taxas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">
                {t('proj.budget.category')}
              </label>
              <Select
                value={newItem.category}
                onValueChange={(val) =>
                  setNewItem({ ...newItem, category: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">
                    {t('proj.budget.material')}
                  </SelectItem>
                  <SelectItem value="labor">
                    {t('proj.budget.labor')}
                  </SelectItem>
                  <SelectItem value="other">
                    {t('proj.budget.other')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-medium">
                {t('proj.budget.quantity')}
              </label>
              <Input
                type="number"
                min={1}
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">
                {t('proj.budget.unit_cost')}
              </label>
              <CurrencyInput
                value={newItem.unitCost}
                onChange={(val) => setNewItem({ ...newItem, unitCost: val })}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleAddItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> {t('add')}
              </Button>
            </div>
          </div>

          {/* Budget Table */}
          <div className="rounded-md border overflow-x-auto w-full block">
            <Table className="min-w-[800px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('proj.budget.item')}</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>{t('proj.budget.category')}</TableHead>
                  <TableHead className="text-right">
                    {t('proj.budget.quantity')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('proj.budget.unit_cost')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('proj.budget.total')}
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.length > 0 ? (
                  budgetItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.costClass === 'soft_cost'
                              ? 'border-purple-200 bg-purple-50 text-purple-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                          }
                        >
                          {item.costClass === 'soft_cost'
                            ? 'Soft Cost'
                            : 'CAPEX'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {t(`proj.budget.${item.category}`)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitCost)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(item.totalCost)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBudgetItem(projectId, item.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('inventory.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
