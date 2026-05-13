import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Link as LinkIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export function ProjectInspections({ projectId }: { projectId: string }) {
  const { getProject, updateInspection } = useProjectStore()
  const project = getProject(projectId)
  const { toast } = useToast()
  const { formatDate } = useLanguageStore()

  if (!project) return null

  const handleStatusChange = (id: string, status: any) => {
    updateInspection(projectId, id, { status, date: new Date() })
    toast({ title: 'Status atualizado' })
  }

  const handleNotesChange = (id: string, notes: string) => {
    updateInspection(projectId, id, { notes })
  }

  const handleFileUpload = (id: string) => {
    const current = project.inspections.find((i) => i.id === id)
    if (current) {
      updateInspection(projectId, id, {
        evidenceUrls: [
          ...current.evidenceUrls,
          'https://img.usecurling.com/p/200/200?q=inspection',
        ],
      })
      toast({ title: 'Evidência anexada (Simulação)' })
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'approved')
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" /> Aprovado
        </Badge>
      )
    if (status === 'rejected')
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" /> Reprovado
        </Badge>
      )
    if (status === 'in_progress')
      return (
        <Badge
          variant="outline"
          className="text-blue-600 bg-blue-50 border-blue-200"
        >
          <Clock className="h-3 w-3 mr-1" /> Em Progresso
        </Badge>
      )
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" /> Pendente
      </Badge>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Inspeções e Qualidade</CardTitle>
        <CardDescription>
          Checklist de vistorias oficiais e controle de qualidade para a região:{' '}
          {project.region === 'US' ? 'USA (Florida)' : 'Brasil'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto w-full block">
          <Table className="min-w-[600px] w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Inspeção</TableHead>
                <TableHead>Data Realizada</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Evidências</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.inspections.map((insp) => (
                <TableRow
                  key={insp.id}
                  className={insp.status === 'rejected' ? 'bg-red-50/50' : ''}
                >
                  <TableCell className="font-medium">{insp.name}</TableCell>
                  <TableCell>
                    {insp.date ? formatDate(insp.date, 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Observações..."
                      defaultValue={insp.notes || ''}
                      onBlur={(e) => handleNotesChange(insp.id, e.target.value)}
                      className="h-8 text-xs bg-transparent"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {insp.evidenceUrls.length > 0 ? (
                        insp.evidenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2"
                        onClick={() => handleFileUpload(insp.id)}
                      >
                        <Upload className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(insp.status)}</TableCell>
                  <TableCell>
                    <Select
                      value={insp.status}
                      onValueChange={(val) => handleStatusChange(insp.id, val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">
                          Em Progresso
                        </SelectItem>
                        <SelectItem value="approved">Aprovar</SelectItem>
                        <SelectItem value="rejected">Reprovar</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
