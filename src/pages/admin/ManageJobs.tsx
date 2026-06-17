import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { MoreHorizontal, Search, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

export default function ManageJobs() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')

  const fetchJobs = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_jobs_with_metrics')
    if (data) {
      const jobIds = data.map((j: any) => j.id)
      const { data: jobDetails } = await supabase
        .from('jobs')
        .select('id, location')
        .in('id', jobIds)

      const enrichedData = data.map((j: any) => {
        const det = jobDetails?.find((d) => d.id === j.id)
        return { ...j, location: det?.location || 'N/A' }
      })
      setJobs(enrichedData)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        (job.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (job.owner_name || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || job.status === statusFilter
      const matchLocation = (job.location || '')
        .toLowerCase()
        .includes(locationFilter.toLowerCase())
      return matchSearch && matchStatus && matchLocation
    })
  }, [jobs, search, statusFilter, locationFilter])

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)
    if (!error) {
      toast({
        title: t('success'),
        description: t('success') || 'Status updated.',
      })
      fetchJobs()
    } else {
      toast({ title: t('error'), variant: 'destructive' })
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm(t('delete.confirm'))) return
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (!error) {
      toast({
        title: t('success'),
        description: t('success') || 'Job deleted.',
      })
      fetchJobs()
    } else {
      toast({ title: t('error'), variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-fade-in space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.jobs.page_title')}
        </h1>
        <p className="text-muted-foreground">{t('admin.jobs.page_desc')}</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.jobs.search')}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.jobs.filter_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('admin.jobs.filter_status')}
                  </SelectItem>
                  <SelectItem value="open">
                    {t('status.open') || 'Open'}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {t('status.in_progress') || 'In Progress'}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t('status.completed') || 'Completed'}
                  </SelectItem>
                  <SelectItem value="suspended">
                    {t('status.suspended') || 'Suspended'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-64 flex items-center gap-2 relative">
              <Input
                placeholder={t('admin.jobs.filter_location')}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.jobs.th.title')}</TableHead>
                  <TableHead>{t('admin.jobs.th.creator')}</TableHead>
                  <TableHead>{t('admin.jobs.th.region')}</TableHead>
                  <TableHead>{t('admin.jobs.th.status')}</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('messages.no_messages')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="font-medium text-primary">
                          {job.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t(`category.${job.category?.toLowerCase()}`) ||
                            job.category ||
                            'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-blue-600">
                          {job.owner_name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          {Number(job.owner_rating || 5).toFixed(1)}{' '}
                          <Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-400" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {job.location !== 'N/A' ? job.location : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            job.status === 'open'
                              ? 'default'
                              : job.status === 'suspended'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            job.status === 'open'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                              : ''
                          }
                        >
                          {t(`status.${job.status}`) || job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {job.status === 'open' ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateJobStatus(job.id, 'suspended')
                                }
                              >
                                {t('admin.jobs.suspend')}
                              </DropdownMenuItem>
                            ) : job.status === 'suspended' ? (
                              <DropdownMenuItem
                                onClick={() => updateJobStatus(job.id, 'open')}
                              >
                                {t('admin.jobs.activate')}
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => deleteJob(job.id)}
                              className="text-red-600"
                            >
                              {t('admin.jobs.delete')}
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
