import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  FileText,
  CalendarDays,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useProjectStore } from '@/stores/useProjectStore'

export default function PartnerDashboard() {
  const { user } = useAuth()
  const { formatCurrency } = useLanguageStore()
  const navigate = useNavigate()
  const { projects: localProjects } = useProjectStore()

  const [dbProjects, setDbProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!user) return

      const { data: ownProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)

      const { data: partnerLinks } = await supabase
        .from('project_partners')
        .select('project_id')
        .eq('vendor_id', user.id)

      let linkedProjects: any[] = []
      if (partnerLinks && partnerLinks.length > 0) {
        const pIds = partnerLinks.map((link) => link.project_id)
        const { data: lp } = await supabase
          .from('projects')
          .select('*')
          .in('id', pIds)
        if (lp) linkedProjects = lp
      }

      const allP = [...(ownProjects || []), ...linkedProjects]
      const uniqueProjects = Array.from(
        new Map(allP.map((p) => [p.id, p])).values(),
      )

      setDbProjects(uniqueProjects)
      setLoading(false)
    }

    fetchPartnerData()
  }, [user])

  const allProjects = [
    ...localProjects.filter((p) => !(p as any).is_demo),
    ...dbProjects.filter(
      (dp) => !localProjects.some((p) => p.id === dp.id) && !dp.is_demo,
    ),
  ]

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Gestão de Obras, Orçamentos e Equipes
        </h2>
        <p className="text-muted-foreground">
          Painel exclusivo para parceiros gerenciarem suas obras e recebíveis.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Equipe Alocada
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recebíveis Previstos
            </CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(0, 'BRL')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <div className="border-b overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 flex gap-6 justify-start w-max min-w-full">
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              Trabalhos
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              Meus Projetos & Tarefas
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              Orçamentos (Propostas)
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              Minha Equipe
            </TabsTrigger>
            <TabsTrigger
              value="vendors"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              Fornecedores
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projects" className="space-y-4">
          {loading ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
              Carregando projetos...
            </div>
          ) : allProjects.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
              Nenhum projeto encontrado.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allProjects.map((project) => (
                <Card
                  key={project.id}
                  className="flex flex-col hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {project.status === 'in_progress'
                            ? 'Em Andamento'
                            : project.status === 'completed'
                              ? 'Concluído'
                              : 'Planejamento'}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString()
                        : project.created_at
                          ? new Date(project.created_at).toLocaleDateString()
                          : ''}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        navigate(`/construction/projects/${project.id}`)
                      }
                    >
                      Acessar Projeto <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            Nenhum trabalho encontrado.
          </div>
        </TabsContent>
        <TabsContent value="quotes">
          <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            Nenhum orçamento encontrado.
          </div>
        </TabsContent>
        <TabsContent value="team">
          <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            Nenhuma equipe encontrada.
          </div>
        </TabsContent>
        <TabsContent value="vendors">
          <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            Nenhum fornecedor encontrado.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
