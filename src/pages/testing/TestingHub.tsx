import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  User,
  Building2,
  Briefcase,
  Zap,
  CheckCircle2,
  Shield,
  Calculator,
  LayoutDashboard,
} from 'lucide-react'
import { useJobStore } from '@/stores/useJobStore'
import { useToast } from '@/hooks/use-toast'

export default function TestingHub() {
  const { login, isAuthenticated, logout } = useAuthStore()
  const { jobs } = useJobStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  useEffect(() => {
    const verifyAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/', { replace: true })
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      const isAdmin =
        data?.is_admin ||
        session.user.email === 'adailtong@gmail.com' ||
        session.user.email?.includes('admin')

      if (!isAdmin) {
        navigate('/', { replace: true })
      } else {
        setIsCheckingAdmin(false)
      }
    }

    verifyAdmin()
  }, [navigate])

  const handleTestLogin = async (email: string) => {
    if (isAuthenticated) logout()
    await login(email, 'password123')
    toast({
      title: 'Ambiente de Teste',
      description: `Logado como ${email}. Dados populados.`,
    })
  }

  const testUsers = [
    {
      role: 'Contratante PF',
      email: 'contractor.pf@bidwork.app',
      desc: 'Usuário padrão para criar jobs.',
      icon: User,
    },
    {
      role: 'Contratante PJ',
      email: 'contractor.pj@bidwork.app',
      desc: 'Conta corporativa (Admin).',
      icon: Building2,
    },
    {
      role: 'Membro: Contador',
      email: 'accountant.pj@bidwork.app',
      desc: 'Acesso restrito ao Financeiro.',
      icon: Calculator,
    },
    {
      role: 'Membro: Gerente',
      email: 'manager.pj@bidwork.app',
      desc: 'Acesso a Obras e Equipe.',
      icon: LayoutDashboard,
    },
    {
      role: 'Executor PF',
      email: 'executor.pf@bidwork.app',
      desc: 'Freelancer individual.',
      icon: Briefcase,
    },
    {
      role: 'Executor PJ',
      email: 'executor.pj@bidwork.app',
      desc: 'Prestador empresa com equipe.',
      icon: Building2,
    },
    {
      role: 'Admin',
      email: 'admin@bidwork.app',
      desc: 'Administrador do sistema.',
      icon: Shield,
    },
  ]

  const activeJobs = jobs.filter((j) => j.status === 'open')
  const historyJobs = jobs.filter((j) => j.status === 'completed')

  if (isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-4 text-center">
        <Badge variant="outline" className="text-primary border-primary">
          Ambiente de Homologação
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Testing Hub</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Utilize esta central para acessar perfis pré-configurados e visualizar
          dados de teste.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testUsers.map((user, i) => (
          <Card key={i} className="hover:border-primary transition-all">
            <CardHeader className="p-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <user.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{user.role}</CardTitle>
              <CardDescription className="text-xs">{user.desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <code className="text-xs bg-muted p-1 rounded block mb-2 overflow-hidden text-ellipsis">
                {user.email}
              </code>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                size="sm"
                onClick={() => handleTestLogin(user.email)}
              >
                <Zap className="mr-2 h-4 w-4" /> Acessar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dados de Seed (Jobs)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" /> Jobs Ativos (
                {activeJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Região</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeJobs.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-medium">{j.title}</TableCell>
                      <TableCell className="capitalize">{j.type}</TableCell>
                      <TableCell>{j.regionCode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Jobs
                Históricos ({historyJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Região</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyJobs.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-medium">{j.title}</TableCell>
                      <TableCell className="capitalize">{j.type}</TableCell>
                      <TableCell>{j.regionCode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
