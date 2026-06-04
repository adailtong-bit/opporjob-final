import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Plus, Wrench, DollarSign, Truck } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function ProjectEquipment({ projectId }: { projectId: string }) {
  const { equipment, returnEquipment } = useEquipmentStore()
  const { formatCurrency, formatDate } = useLanguageStore()
  const { toast } = useToast()

  const [dbEquipment, setDbEquipment] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('equipment')
      .select('*')
      .eq('project_id', projectId)
      .then(({ data }) => {
        if (data) {
          setDbEquipment(
            data.map((e) => ({
              id: e.id,
              name: e.name,
              type: e.type,
              status: e.status,
              projectId: e.project_id,
              rentalValue: 0,
              nextMaintenance: new Date(),
            })),
          )
        }
      })
  }, [projectId])

  const projectEquipment = [
    ...equipment.filter((eq) => eq.projectId === projectId),
    ...dbEquipment,
  ]

  return (
    <div className="space-y-6 min-w-0 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-xl border shadow-sm gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Máquinas (Aluguel e
            Manutenção)
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os equipamentos alocados para esta obra.
          </p>
        </div>
        <Button asChild>
          <Link to="/construction/equipment">
            <Plus className="mr-2 h-4 w-4" /> Alocar Máquina
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table className="min-w-[700px] w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Máquina</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Aluguel</TableHead>
                <TableHead>Manutenção</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectEquipment.length > 0 ? (
                projectEquipment.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell className="font-medium">{eq.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{eq.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {eq.rentalValue ? (
                        <div className="flex items-center gap-1 font-medium text-emerald-600">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(eq.rentalValue)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Próprio
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Wrench className="h-3 w-3" />
                        {formatDate(eq.nextMaintenance, 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          eq.status === 'maintenance'
                            ? 'destructive'
                            : 'default'
                        }
                        className={
                          eq.status === 'in_use'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : ''
                        }
                      >
                        {eq.status === 'maintenance'
                          ? 'Em Manutenção'
                          : 'Em Obra (Allocated)'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {eq.status === 'in_use' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            returnEquipment(eq.id)
                            toast({
                              title: 'Check-in realizado com sucesso.',
                              description: 'Máquina devolvida ao pátio global.',
                            })
                          }}
                        >
                          Check-in (Devolver)
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma máquina alocada para este projeto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
