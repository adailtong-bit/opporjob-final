import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useInvoices } from '@/hooks/use-invoices'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, CheckCircle2, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function TeamInvoicing() {
  const { projects, generateInvoice } = useProjectStore()
  const { user } = useAuthStore()
  const { createInvoice } = useInvoices(user?.id)
  const { toast } = useToast()
  const { formatCurrency } = useLanguageStore()

  // In real app, derived from auth
  const currentWorkerId = user?.id || 'member-1'
  const currentWorkerName = user?.name || 'Profissional'

  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  // Find tasks assigned to this worker that are completed but not invoiced
  const billableTasks = projects
    .flatMap((p) =>
      p.stages.flatMap((s) =>
        s.subStages.map((sub) => ({
          ...sub,
          projectId: p.id,
          stageId: s.id,
          projectName: p.name,
        })),
      ),
    )
    .filter(
      (task) =>
        task.assignedTeamMemberId === currentWorkerId &&
        task.status === 'completed' &&
        task.invoiceStatus !== 'sent_to_partner' &&
        task.invoiceStatus !== 'paid',
    )

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    )
  }

  const handleInvoice = async () => {
    if (selectedTasks.length === 0) return

    for (const taskId of selectedTasks) {
      const task = billableTasks.find((t) => t.id === taskId)
      if (task) {
        await createInvoice({
          project_id: task.projectId,
          task_id: task.id,
          payer_id: undefined,
          receiver_id: user?.id,
          amount: task.taskPrice || 0,
          description: `Fatura referente a tarefa: ${task.name}`,
          status: 'pending',
        })

        generateInvoice(
          task.projectId,
          task.stageId,
          task.id,
          'team_to_partner',
        )
      }
    }

    toast({
      title: 'Fatura Gerada',
      description: `Fatura enviada para o parceiro referente a ${selectedTasks.length} tarefas.`,
    })
    setSelectedTasks([])
  }

  const totalSelected = billableTasks
    .filter((t) => selectedTasks.includes(t.id))
    .reduce((acc, t) => acc + (t.taskPrice || 0), 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Minhas Faturas (Contratado)
        </h1>
        <p className="text-muted-foreground">
          Painel do Profissional: {currentWorkerName}. Selecione tarefas
          concluídas para receber.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tarefas Concluídas a Faturar</CardTitle>
          <CardDescription>
            Selecione os itens para gerar a cobrança ao parceiro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billableTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>Nenhuma tarefa pendente de faturamento.</p>
              <p className="text-sm mt-1">
                Conclua suas atribuições no cronograma para que apareçam aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {billableTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center p-4 border rounded-lg transition-colors ${selectedTasks.includes(task.id) ? 'border-primary bg-primary/5' : 'bg-card'}`}
                >
                  <Checkbox
                    id={task.id}
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={task.id}
                      className="font-medium cursor-pointer hover:underline"
                    >
                      {task.name}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Projeto: {task.projectName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className="mb-1 bg-green-50 text-green-700 border-green-200"
                    >
                      Concluído
                    </Badge>
                    <p className="font-bold text-lg">
                      {formatCurrency(task.taskPrice || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Total Selecionado
            </span>
            <span className="text-2xl font-bold flex items-center">
              <DollarSign className="h-5 w-5 text-primary" />
              {formatCurrency(totalSelected)}
            </span>
          </div>
          <Button
            size="lg"
            onClick={handleInvoice}
            disabled={selectedTasks.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" /> Gerar Fatura
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
