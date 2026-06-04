import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Activity, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { cn } from '@/lib/utils'

export function ProjectOverview({
  projectId,
  progress,
}: {
  projectId: string
  progress: number
}) {
  const [stats, setStats] = useState({
    estimated: 0,
    actual: 0,
    compliant: 0,
    totalDocs: 0,
    expired: 0,
    invoicePaid: 0,
    invoicePending: 0,
  })
  const { formatCurrency } = useLanguageStore()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: budgets } = await supabase
        .from('project_budgets')
        .select('estimated_amount, actual_amount')
        .eq('project_id', projectId)
      const { data: docs } = await supabase
        .from('project_compliance')
        .select('status')
        .eq('project_id', projectId)
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, amount')
        .eq('project_id', projectId)

      let estimated = 0
      let actual = 0
      budgets?.forEach((b) => {
        estimated += Number(b.estimated_amount)
        actual += Number(b.actual_amount)
      })

      let compliant = 0
      let expired = 0
      docs?.forEach((d) => {
        if (d.status === 'compliant') compliant++
        if (d.status === 'expired') expired++
      })

      let invoicePaid = 0
      let invoicePending = 0
      invoices?.forEach((inv) => {
        if (inv.status === 'paid') invoicePaid += Number(inv.amount)
        if (inv.status === 'pending' || inv.status === 'overdue')
          invoicePending += Number(inv.amount)
      })

      setStats({
        estimated,
        actual,
        compliant,
        totalDocs: docs?.length || 0,
        expired,
        invoicePaid,
        invoicePending,
      })
    }
    fetchStats()
  }, [projectId])

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 animate-fade-in w-full min-w-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.estimated)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Planned allocation
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Amount Spent</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(stats.actual)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Actual expenditure
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(stats.invoicePaid)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-orange-500 font-medium">
              {formatCurrency(stats.invoicePending)}
            </span>{' '}
            pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress}%</div>
          <Progress value={progress} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.compliant} / {stats.totalDocs}
          </div>
          <p
            className={cn('text-xs mt-1 font-medium', {
              'text-red-500': stats.expired > 0,
              'text-muted-foreground': stats.expired === 0,
            })}
          >
            {stats.expired} expired document(s)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
