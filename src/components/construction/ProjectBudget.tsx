import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { DollarSign, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrencyValue } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ProjectBudget({ projectId }: { projectId: string }) {
  const [budgets, setBudgets] = useState<any[]>([])

  useEffect(() => {
    const fetchBudgets = async () => {
      const { data } = await supabase
        .from('project_budgets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      if (data) setBudgets(data)
    }
    fetchBudgets()
  }, [projectId])

  const totalEstimated = budgets.reduce(
    (acc, b) => acc + Number(b.estimated_amount),
    0,
  )
  const totalActual = budgets.reduce(
    (acc, b) => acc + Number(b.actual_amount),
    0,
  )
  const totalVariance = totalEstimated - totalActual

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Budget & Estimation
          </CardTitle>
          <CardDescription>
            Track estimated vs actual costs across categories.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto w-full block">
          <Table className="min-w-[600px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Estimated</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.length > 0 ? (
                budgets.map((b) => {
                  const variance =
                    Number(b.estimated_amount) - Number(b.actual_amount)
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {b.category}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyValue(b.estimated_amount, 'USD')}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyValue(b.actual_amount, 'USD')}
                      </TableCell>
                      <TableCell
                        className={cn('text-right font-bold', {
                          'text-red-500': variance < 0,
                          'text-green-500': variance >= 0,
                        })}
                      >
                        {formatCurrencyValue(variance, 'USD')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.status === 'over_budget'
                              ? 'destructive'
                              : b.status === 'on_track'
                                ? 'default'
                                : 'secondary'
                          }
                          className={cn(
                            'uppercase text-[10px]',
                            b.status === 'on_track' &&
                              'bg-green-500 hover:bg-green-600',
                          )}
                        >
                          {b.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <DollarSign className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p>No budget data available.</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Create Budget
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {budgets.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row justify-end gap-4 md:gap-8 bg-muted/30 p-4 rounded-lg">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Estimated</p>
              <p className="text-xl font-bold">
                {formatCurrencyValue(totalEstimated, 'USD')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Actual</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrencyValue(totalActual, 'USD')}
              </p>
            </div>
            <div className="text-right border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-8">
              <p className="text-sm text-muted-foreground">Total Variance</p>
              <p
                className={cn('text-xl font-bold', {
                  'text-red-500': totalVariance < 0,
                  'text-green-500': totalVariance >= 0,
                })}
              >
                {formatCurrencyValue(totalVariance, 'USD')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
