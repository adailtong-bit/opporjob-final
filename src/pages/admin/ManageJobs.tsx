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
import { MoreHorizontal, Search, Star, Edit, Trash2, Bot } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const CENTRAL_FL_CITIES = [
  'Orlando',
  'Kissimmee',
  'Sanford',
  'Winter Park',
  'Clermont',
  'Altamonte Springs',
  'Oviedo',
  'Apopka',
  'Lake Mary',
  'Maitland',
]

const MAINTENANCE_SERVICES = [
  {
    title: 'Professional Interior Painting',
    category: 'Painting',
    sub_category: 'Interior',
  },
  {
    title: 'Emergency HVAC Maintenance',
    category: 'HVAC',
    sub_category: 'Repair',
  },
  {
    title: 'Pool Screen Repair',
    category: 'Pool',
    sub_category: 'Maintenance',
  },
  {
    title: 'Residential Plumbing Leak Fix',
    category: 'Plumbing',
    sub_category: 'Repair',
  },
  {
    title: 'Electrical Panel Upgrade',
    category: 'Electrical',
    sub_category: 'Installation',
  },
  {
    title: 'Hardwood Floor Installation',
    category: 'Flooring',
    sub_category: 'Installation',
  },
  {
    title: 'Kitchen Cabinet Refinishing',
    category: 'Carpentry',
    sub_category: 'Refinishing',
  },
  {
    title: 'Roof Shingle Replacement',
    category: 'Roofing',
    sub_category: 'Repair',
  },
  {
    title: 'Driveway Pressure Washing',
    category: 'Cleaning',
    sub_category: 'Exterior',
  },
  {
    title: 'Lawn Care & Landscaping',
    category: 'Landscaping',
    sub_category: 'Maintenance',
  },
]

const DESCRIPTIONS = [
  'Looking for experienced professionals to handle this project. Must be licensed and insured. Prompt completion is required.',
  'We need a reliable contractor for this maintenance task. Quality materials must be used. Please provide an estimate.',
  'Urgent request for service. Needs to be completed as soon as possible. Previous experience with similar jobs preferred.',
  'Full service required from start to finish. Site must be left clean daily. Looking forward to working with top talent.',
  'Standard repair and maintenance job. Flexible on schedule but expect high-quality workmanship.',
]

export default function ManageJobs() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [showDemoOnly, setShowDemoOnly] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [editingJob, setEditingJob] = useState<any>(null)

  const fetchJobs = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_jobs_with_metrics')
    if (data && data.length > 0) {
      const jobIds = data.map((j: any) => j.id)

      const batchSize = 500
      let jobDetails: any[] = []

      for (let i = 0; i < jobIds.length; i += batchSize) {
        const batchIds = jobIds.slice(i, i + batchSize)
        const { data: batchData } = await supabase
          .from('jobs')
          .select('id, location, is_demo, budget')
          .in('id', batchIds)
        if (batchData) {
          jobDetails = [...jobDetails, ...batchData]
        }
      }

      const enrichedData = data.map((j: any) => {
        const det = jobDetails?.find((d) => d.id === j.id)
        return {
          ...j,
          location: det?.location || 'N/A',
          is_demo: !!det?.is_demo,
          budget: det?.budget || j.budget || 0,
        }
      })

      enrichedData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      setJobs(enrichedData)
    } else {
      setJobs([])
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
      const matchDemo = showDemoOnly ? job.is_demo === true : true
      return matchSearch && matchStatus && matchLocation && matchDemo
    })
  }, [jobs, search, statusFilter, locationFilter, showDemoOnly])

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)
    if (!error) {
      toast({
        title: t('success') || 'Success',
        description: 'Status updated.',
      })
      fetchJobs()
    } else {
      toast({ title: t('error') || 'Error', variant: 'destructive' })
    }
  }

  const deleteJob = async (jobId: string) => {
    if (
      !confirm(
        t('delete.confirm') || 'Are you sure you want to delete this job?',
      )
    )
      return
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (!error) {
      toast({
        title: t('success') || 'Success',
        description: 'Job deleted.',
      })
      fetchJobs()
    } else {
      toast({ title: t('error') || 'Error', variant: 'destructive' })
    }
  }

  const handleGenerateDemos = async () => {
    if (!confirm('Generate 100 English demo jobs for Central Florida?')) return

    setGenerating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const newJobs = Array.from({ length: 100 }).map(() => {
        const service =
          MAINTENANCE_SERVICES[
            Math.floor(Math.random() * MAINTENANCE_SERVICES.length)
          ]
        const city =
          CENTRAL_FL_CITIES[
            Math.floor(Math.random() * CENTRAL_FL_CITIES.length)
          ]
        const desc =
          DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)]
        const budget = Math.floor(Math.random() * 900) + 100

        return {
          title: service.title,
          category: service.category,
          sub_category: service.sub_category,
          description: desc,
          location: city,
          budget: budget,
          status: 'completed',
          is_demo: true,
          owner_name: 'Property Manager',
          owner_id: user?.id,
          currency: 'USD',
          source: 'internal',
          listing_type: 'service',
        }
      })

      const { error } = await supabase.from('jobs').insert(newJobs)

      if (error) throw error

      toast({
        title: 'Success',
        description: '100 demo jobs generated successfully.',
      })
      fetchJobs()
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate demo jobs',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingJob) return
    const { error } = await supabase
      .from('jobs')
      .update({
        title: editingJob.title,
        description: editingJob.description,
        budget: editingJob.budget,
        location: editingJob.location,
      })
      .eq('id', editingJob.id)

    if (!error) {
      toast({ title: 'Success', description: 'Job updated successfully.' })
      setEditingJob(null)
      fetchJobs()
    } else {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Enrichment Hub
          </h1>
          <p className="text-muted-foreground">
            Manage jobs and generate demo service history.
          </p>
        </div>
        <Button
          onClick={handleGenerateDemos}
          disabled={generating}
          className="gap-2 shrink-0"
        >
          <Bot className="h-4 w-4" />
          {generating ? 'Generating...' : 'Generate 100 English Ads (Florida)'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.jobs.search') || 'Search jobs...'}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admin.jobs.filter_status') || 'Status'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48 flex items-center gap-2 relative">
              <Input
                placeholder={t('admin.jobs.filter_location') || 'Location'}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 shrink-0 bg-muted/30 p-2 rounded-md border h-10 px-3">
              <Switch
                id="demo-mode"
                checked={showDemoOnly}
                onCheckedChange={setShowDemoOnly}
              />
              <Label htmlFor="demo-mode" className="cursor-pointer">
                Demo Only
              </Label>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('admin.jobs.th.title') || 'Title & Category'}
                  </TableHead>
                  <TableHead>
                    {t('admin.jobs.th.creator') || 'Creator'}
                  </TableHead>
                  <TableHead>
                    {t('admin.jobs.th.region') || 'Location'}
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>{t('admin.jobs.th.status') || 'Status'}</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t('loading') || 'Loading...'}
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('messages.no_messages') || 'No records found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="font-medium text-primary flex items-center gap-2">
                          <span className="truncate max-w-[200px] inline-block">
                            {job.title}
                          </span>
                          {job.is_demo && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1 bg-amber-100 text-amber-800 shrink-0"
                            >
                              Demo
                            </Badge>
                          )}
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(job.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem
                              onClick={() => setEditingJob(job)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {job.status === 'open' ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateJobStatus(job.id, 'suspended')
                                }
                              >
                                {t('admin.jobs.suspend') || 'Suspend'}
                              </DropdownMenuItem>
                            ) : job.status === 'suspended' ? (
                              <DropdownMenuItem
                                onClick={() => updateJobStatus(job.id, 'open')}
                              >
                                {t('admin.jobs.activate') || 'Activate'}
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => deleteJob(job.id)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('admin.jobs.delete') || 'Delete'}
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

      <Dialog
        open={!!editingJob}
        onOpenChange={(open) => !open && setEditingJob(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Record</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingJob.title || ''}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editingJob.location || ''}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Budget (USD)</Label>
                <Input
                  type="number"
                  value={editingJob.budget || 0}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      budget: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingJob.description || ''}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
