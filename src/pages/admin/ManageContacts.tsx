import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, Mail, MoreHorizontal, CheckCircle, Eye } from 'lucide-react'

export default function ManageContacts() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_requests' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar mensagens de contato.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests' as any)
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Status da solicitação atualizado para ${status}`)
      setRequests(
        requests.map((req) => (req.id === id ? { ...req, status } : req)),
      )
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao atualizar status.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Pendente
          </Badge>
        )
      case 'read':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            Lido
          </Badge>
        )
      case 'resolved':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Resolvido
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSubjectTranslation = (subject: string) => {
    const translations: Record<string, string> = {
      Partnership: 'Parceria',
      Support: 'Suporte',
      'Interest in Services': 'Serviços',
      Other: 'Outros',
    }
    return translations[subject] || subject
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fale Conosco</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as mensagens e solicitações enviadas pelo formulário
            público.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Caixa de Entrada</CardTitle>
          <CardDescription>
            Mostrando todas as mensagens recebidas, ordenadas pelas mais
            recentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                      Carregando solicitações...
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Nenhuma solicitação de contato recebida.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow
                      key={req.id}
                      className={
                        req.status === 'pending'
                          ? 'bg-slate-50 dark:bg-slate-900/50'
                          : ''
                      }
                    >
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        {format(new Date(req.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{req.name}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{req.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {req.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSubjectTranslation(req.subject)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-[250px] truncate"
                        title={req.message}
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {req.message}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateStatus(req.id, 'read')}
                            >
                              <Eye className="w-4 h-4 mr-2" /> Marcar como Lido
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatus(req.id, 'resolved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />{' '}
                              Marcar como Resolvido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
