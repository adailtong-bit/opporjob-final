import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CheckCircle, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProjectApprovalWorkflow({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([])
  const { formatDate } = useLanguageStore()

  useEffect(() => {
    const fetchLogs = async () => {
      // Fetch audit logs for this project or project updates
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setLogs(data)
      } else {
        // Fallback to project updates if no audit logs exist (since audit_logs is populated by triggers)
        const { data: updates } = await supabase
          .from('project_updates')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
        if (updates) {
          setLogs(
            updates.map((u) => ({
              id: u.id,
              action: 'UPDATE',
              entity_type: 'project_updates',
              new_data: { title: u.title, description: u.description },
              created_at: u.created_at,
            })),
          )
        }
      }
    }
    fetchLogs()
  }, [projectId])

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" /> Approvals & Activity
          Log
        </CardTitle>
        <CardDescription>
          History of significant project events and status changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-4">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                <div className="bg-card border p-4 rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">
                        {log.action} on {log.entity_type}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.new_data?.title ||
                          log.new_data?.status ||
                          JSON.stringify(log.new_data)}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {formatDate(log.created_at, 'PPP p')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
            <div className="flex flex-col items-center justify-center gap-2">
              <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p>No activity logs found for this project.</p>
              <Button variant="outline" size="sm" className="mt-2">
                Record Activity
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
