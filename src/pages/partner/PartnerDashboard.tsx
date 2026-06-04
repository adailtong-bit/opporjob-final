import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building,
  Users,
  FileText,
  Calendar,
  ArrowRight,
  Star,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Link, useNavigate } from 'react-router-dom'
import { formatCurrencyValue } from '@/lib/utils'

export default function PartnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeProjects, setActiveProjects] = useState<any[]>([])
  const [allocatedTeamCount, setAllocatedTeamCount] = useState(0)
  const [expectedReceivables, setExpectedReceivables] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        const vendorId = vendorData?.id

        if (vendorId) {
          const { data: partnerProjects } = await supabase
            .from('project_partners')
            .select('project_id, projects(*)')
            .eq('vendor_id', vendorId)

          const projects =
            partnerProjects
              ?.map((pp) => pp.projects)
              .filter((p) => p && p.status === 'in_progress') || []

          setActiveProjects(projects)
        } else {
          setActiveProjects([])
        }

        const { data: invoices } = await supabase
          .from('invoices')
          .select('amount')
          .eq('receiver_id', user.id)
          .in('status', ['pending', 'generated', 'approved'])

        const totalReceivables =
          invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
        setExpectedReceivables(totalReceivables)

        setAllocatedTeamCount(0)
      } catch (err) {
        console.error('Error fetching partner data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Painel do Parceiro
          </h1>
          <p className="text-muted-foreground">
            Gestão de Obras, Orçamentos e Equipes |{' '}
            {user?.user_metadata?.name || 'Parceiro'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 py-1.5 px-3 rounded-full text-sm font-semibold flex items-center gap-1.5"
          >
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Score: 0
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : activeProjects.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipe Alocada
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : allocatedTeamCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recebíveis Previstos
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : formatBRL(expectedReceivables)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto w-full justify-start md:w-auto overflow-x-auto bg-transparent border-b rounded-none p-0 space-x-6">
          <TabsTrigger
            value="jobs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
          >
            Trabalhos
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
          >
            Meus Projetos & Tarefas
          </TabsTrigger>
          <TabsTrigger
            value="quotes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
          >
            Orçamentos (Propostas)
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
          >
            Minha Equipe
          </TabsTrigger>
          <TabsTrigger
            value="vendors"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2"
          >
            Fornecedores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <Card
                  key={project.id}
                  className="flex flex-col hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                        Em Andamento
                      </Badge>
                      {project.is_demo && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-300"
                        >
                          DEMO
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {project.description || 'Nenhuma descrição fornecida.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString(
                              'pt-BR',
                            )
                          : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate(
                          `/construction/projects/${project.id}?from=partner`,
                        )
                      }
                    >
                      Acessar Projeto <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // Empty State Mock cards to match AC requirement
              <>
                <Card className="flex flex-col hover:border-primary/50 transition-colors opacity-80">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-blue-500 text-white">
                        Em Andamento
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-300"
                      >
                        DEMO
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">
                      Modern Eco-Villa
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      A state-of-the-art sustainable villa featuring solar
                      integration...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>04/06/2026</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate('/construction/projects/demo-1?from=partner')
                      }
                    >
                      Acessar Projeto <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="flex flex-col hover:border-primary/50 transition-colors opacity-80">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-blue-500 text-white">
                        Em Andamento
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-300"
                      >
                        DEMO
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-1">
                      Residencial Aurora
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      Projeto de construção de edifício residencial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>04/06/2026</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate('/construction/projects/demo-2?from=partner')
                      }
                    >
                      Acessar Projeto <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Trabalhos Disponíveis</CardTitle>
              <CardDescription>
                Busque oportunidades e envie propostas (Bids).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum trabalho aberto no momento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos (Propostas)</CardTitle>
              <CardDescription>
                Acompanhe o status das suas cotações enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                Você não possui orçamentos pendentes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Minha Equipe</CardTitle>
              <CardDescription>
                Gerencie os membros alocados nas suas obras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum membro cadastrado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Fornecedores</CardTitle>
                <CardDescription>
                  Cadastre parceiros com dados completos de faturamento,
                  logística e pagamento.
                </CardDescription>
              </div>
              <Button>+ Novo Fornecedor</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum fornecedor cadastrado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
