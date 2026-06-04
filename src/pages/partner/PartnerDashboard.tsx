import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'
import { Calendar, HardHat } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'

export default function PartnerDashboard() {
  const { user } = useAuth()
  const { t, formatDate } = useLanguageStore()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      if (!user) return

      const { data: vendors } = await supabase
        .from('vendors')
        .select('id')
        .eq('owner_id', user.id)

      if (vendors && vendors.length > 0) {
        const vendorIds = vendors.map((v) => v.id)

        const { data: partners } = await supabase
          .from('project_partners')
          .select(
            `
            project_id,
            projects (*)
          `,
          )
          .in('vendor_id', vendorIds)

        if (partners) {
          const uniqueProjectsMap = new Map()
          partners.forEach((p: any) => {
            if (p.projects && !uniqueProjectsMap.has(p.projects.id)) {
              uniqueProjectsMap.set(p.projects.id, p.projects)
            }
          })
          setProjects(Array.from(uniqueProjectsMap.values()))
        }
      }
      setLoading(false)
    }

    fetchAssignedProjects()
  }, [user])

  return (
    <div className="container mx-auto py-8 animate-fade-in max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {t('partner.dashboard.title') || 'Partner Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {t('partner.dashboard.subtitle') || 'Projects assigned to you'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">{t('loading') || 'Loading...'}</div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HardHat className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">
              {t('partner.no_projects') || 'No projects assigned'}
            </h3>
            <p className="text-muted-foreground max-w-md text-center">
              {t('partner.no_projects.desc') ||
                'You are not assigned to any projects yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:border-primary/50 transition-colors flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant={
                      project.status === 'in_progress' ? 'default' : 'secondary'
                    }
                  >
                    {t(`status.${project.status}`) || project.status}
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
                <CardTitle className="text-xl line-clamp-1">
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description ||
                    t('general.no_description') ||
                    'No description.'}
                </p>
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {project.created_at
                      ? formatDate(new Date(project.created_at), 'P')
                      : 'N/A'}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/construction/projects/${project.id}`}>
                      {t('action.view_project') || 'View Project'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
