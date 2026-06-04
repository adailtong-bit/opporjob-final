import { useEffect, useState } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function ProjectCompliance({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<any[]>([])
  const { formatDate } = useLanguageStore()

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase
        .from('project_compliance')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (data) setDocs(data)
    }
    fetchDocs()
  }, [projectId])

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Compliance & Legal
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider text-[10px] uppercase ml-2">
            DEMO
          </Badge>
        </CardTitle>
        <CardDescription>
          Monitor active and expired documents essential for operation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto w-full block">
          <Table className="min-w-[600px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    {d.document_name}
                  </TableCell>
                  <TableCell>
                    {d.expiry_date
                      ? formatDate(d.expiry_date, 'dd/MM/yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {d.status === 'compliant' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Compliant
                      </Badge>
                    ) : d.status === 'expired' ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Expired
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="uppercase text-[10px]"
                      >
                        {d.status}
                      </Badge>
                    )}
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
