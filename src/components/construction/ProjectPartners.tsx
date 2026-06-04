import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function ProjectPartners({ projectId }: { projectId: string }) {
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    const fetchPartners = async () => {
      const { data } = await supabase
        .from('project_partners')
        .select('role, vendors(*)')
        .eq('project_id', projectId)
      if (data) setPartners(data)
    }
    fetchPartners()
  }, [projectId])

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Partners & Vendors
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider text-[10px] uppercase ml-2">
            DEMO
          </Badge>
        </CardTitle>
        <CardDescription>
          Contractors and suppliers actively linked to this project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div
              key={p.vendors.id}
              className="border p-5 rounded-lg bg-card shadow-sm hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {p.vendors.name}
                  </h3>
                  {p.vendors.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.vendors.category}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="whitespace-nowrap shrink-0">
                  {p.role}
                </Badge>
              </div>
              <div className="text-sm space-y-2 mt-4 bg-muted/30 p-3 rounded-md">
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{p.vendors.email || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{p.vendors.phone || 'N/A'}</span>
                </p>
              </div>
            </div>
          ))}
          {partners.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No partners linked to this project yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
