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
import {
  MoreHorizontal,
  Search,
  Star,
  Edit,
  Trash2,
  Bot,
  CheckCircle,
  X,
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

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
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [generating, setGenerating] = useState(false)

  const [editingJob, setEditingJob] = useState<any>(null)

  // Bulk Selection
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])

  // Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [genCategories, setGenCategories] = useState<any[]>([])
  const [genQuantity, setGenQuantity] = useState(100)
  const [genDate, setGenDate] = useState('')

  useEffect(() => {
    supabase
      .from('categories')
      .select('*, subcategories(*)')
      .then(({ data }) => {
        if (data) {
          setCategories(data)
        }
      })
  }, [])

  const getCategoryLabel = (catNameOrSlug: string) => {
    if (!catNameOrSlug) return 'N/A'
    const cat = categories.find(
      (c) => c.name === catNameOrSlug || c.slug === catNameOrSlug,
    )
    if (cat && cat.translation_key) {
      return t(cat.translation_key) || cat.name
    }
    return t(`category.${catNameOrSlug.toLowerCase()}`) || catNameOrSlug
  }

  const getSubCategoryLabel = (subNameOrSlug: string, categoryName: string) => {
    if (!subNameOrSlug) return ''
    const cat = categories.find(
      (c) => c.name === categoryName || c.slug === categoryName,
    )
    if (cat && cat.subcategories) {
      const sub = cat.subcategories.find(
        (s: any) => s.name === subNameOrSlug || s.slug === subNameOrSlug,
      )
      if (sub && sub.translation_key) {
        return t(sub.translation_key) || sub.name
      }
    }
    return t(`subcat.${subNameOrSlug.toLowerCase()}`) || subNameOrSlug
  }

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
          .select('id, location, is_demo, budget, sub_category')
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
          sub_category: det?.sub_category || null,
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
    setSelectedJobs([])
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
      const matchCategory =
        categoryFilter === 'all' || job.category === categoryFilter
      const matchLocation = (job.location || '')
        .toLowerCase()
        .includes(locationFilter.toLowerCase())
      const matchDemo = showDemoOnly ? job.is_demo === true : true
      const matchDate =
        !dateFilter ||
        new Date(job.created_at).toISOString().split('T')[0] === dateFilter
      return (
        matchSearch &&
        matchStatus &&
        matchCategory &&
        matchLocation &&
        matchDemo &&
        matchDate
      )
    })
  }, [
    jobs,
    search,
    statusFilter,
    categoryFilter,
    locationFilter,
    showDemoOnly,
    dateFilter,
  ])

  const visibleSelectedJobs = useMemo(() => {
    const filteredIds = new Set(filteredJobs.map((j) => j.id))
    return selectedJobs.filter((id) => filteredIds.has(id))
  }, [selectedJobs, filteredJobs])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedJobs)
      filteredJobs.forEach((j) => newSelected.add(j.id))
      setSelectedJobs(Array.from(newSelected))
    } else {
      const filteredIds = new Set(filteredJobs.map((j) => j.id))
      setSelectedJobs((prev) => prev.filter((id) => !filteredIds.has(id)))
    }
  }

  const handleSelectJob = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs((prev) => Array.from(new Set([...prev, id])))
    } else {
      setSelectedJobs((prev) => prev.filter((jobId) => jobId !== id))
    }
  }

  const handleBulkApprove = async () => {
    if (!visibleSelectedJobs.length) return

    const jobsToApprove = filteredJobs.filter(
      (j) => visibleSelectedJobs.includes(j.id) && !j.is_demo && !j.isDemo,
    )
    const demoJobsCount = visibleSelectedJobs.length - jobsToApprove.length

    if (jobsToApprove.length === 0) {
      if (demoJobsCount > 0) {
        toast({
          title: 'Info',
          description: 'Demo jobs cannot be published/approved.',
        })
      }
      return
    }

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'open' })
      .in(
        'id',
        jobsToApprove.map((j) => j.id),
      )

    if (!error) {
      let desc = 'Jobs published/approved.'
      if (demoJobsCount > 0) {
        desc += ` (${demoJobsCount} demo jobs excluded)`
      }
      toast({
        title: t('success') || 'Success',
        description: desc,
      })
      fetchJobs()
    } else {
      toast({
        title: t('error') || 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (!visibleSelectedJobs.length) return
    if (
      !confirm(
        t('delete.confirm') || 'Are you sure you want to delete these items?',
      )
    )
      return
    const { error } = await supabase
      .from('jobs')
      .delete()
      .in('id', visibleSelectedJobs)

    if (!error) {
      toast({ title: t('success') || 'Success', description: 'Jobs deleted.' })
      fetchJobs()
    } else {
      toast({
        title: t('error') || 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if ((job?.is_demo || job?.isDemo) && newStatus === 'open') {
      toast({
        title: 'Info',
        description: 'Demo jobs cannot be opened.',
      })
      return
    }

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

  const handleGenerateConfiguredDemos = async () => {
    if (genCategories.length === 0) {
      toast({
        title: 'Error',
        description: 'Select at least one category.',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const newJobs = Array.from({ length: genQuantity }).map((_, i) => {
        const category =
          genCategories[Math.floor(Math.random() * genCategories.length)]
        const city =
          CENTRAL_FL_CITIES[
            Math.floor(Math.random() * CENTRAL_FL_CITIES.length)
          ]
        const desc =
          DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)]
        const budget = Math.floor(Math.random() * 900) + 100

        let createdAt = new Date().toISOString()
        if (genDate) {
          const baseTime = new Date(genDate).getTime()
          const randomOffset = Math.floor(
            Math.random() * 1000 * 60 * 60 * 24 * 7,
          ) // random offset up to 7 days after the selected date
          createdAt = new Date(baseTime + randomOffset).toISOString()
        }

        return {
          title: `${category.name} Request - Ref ${Math.floor(Math.random() * 10000)}`,
          category: category.name,
          sub_category: 'General',
          description: desc,
          location: city,
          budget: budget,
          status: 'completed',
          is_demo: true,
          owner_name: 'System Generator',
          owner_id: user?.id,
          currency: 'USD',
          source: 'internal',
          listing_type: 'service',
          created_at: createdAt,
        }
      })

      const batchSize = 100
      for (let i = 0; i < newJobs.length; i += batchSize) {
        const batch = newJobs.slice(i, i + batchSize)
        const { error } = await supabase.from('jobs').insert(batch)
        if (error) throw error
      }

      toast({
        title: 'Success',
        description: `${genQuantity} jobs generated successfully.`,
      })
      setIsGenerateModalOpen(false)
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
          onClick={() => setIsGenerateModalOpen(true)}
          className="gap-2 shrink-0"
        >
          <Bot className="h-4 w-4" />
          {t('admin.jobs.generate.title') || 'Generate Ads'}
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
            <div className="w-full md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admin.jobs.filter_status') || 'Status'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending_approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admin.jobs.filter_category') || 'Category'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {getCategoryLabel(cat.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48 flex items-center gap-2 relative">
              <Input
                type="date"
                placeholder={t('admin.jobs.filter_date') || 'Date'}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pr-8"
              />
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setDateFilter('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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

          {visibleSelectedJobs.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex items-center justify-between animate-fade-in">
              <span className="text-sm font-medium text-primary">
                {visibleSelectedJobs.length}{' '}
                {t('admin.jobs.selected') || 'item(s) selected'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t('admin.jobs.bulk.approve') || 'Approve Selected'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('admin.jobs.bulk.delete') || 'Delete Selected'}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        filteredJobs.length > 0 &&
                        filteredJobs.every((j) => selectedJobs.includes(j.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
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
                    <TableCell colSpan={7} className="text-center py-8">
                      {t('loading') || 'Loading...'}
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('messages.no_messages') || 'No records found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className={
                        selectedJobs.includes(job.id) ? 'bg-muted/50' : ''
                      }
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={(checked) =>
                            handleSelectJob(job.id, !!checked)
                          }
                        />
                      </TableCell>
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
                          {getCategoryLabel(job.category)}
                          {job.sub_category && (
                            <span className="opacity-75">
                              {' '}
                              •{' '}
                              {getSubCategoryLabel(
                                job.sub_category,
                                job.category,
                              )}
                            </span>
                          )}
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
                                : job.status === 'completed'
                                  ? 'destructive'
                                  : 'outline'
                          }
                          className={cn(
                            job.status === 'open' &&
                              'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
                            job.status === 'pending_approval' &&
                              'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
                            job.status === 'completed' &&
                              'bg-destructive text-destructive-foreground hover:bg-destructive',
                          )}
                        >
                          {job.status === 'completed'
                            ? t('status.completed') || 'Closed'
                            : t(`status.${job.status}`) || job.status}
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
                            {!(job.is_demo || job.isDemo) &&
                            (job.status === 'suspended' ||
                              job.status === 'pending_approval') ? (
                              <DropdownMenuItem
                                onClick={() => updateJobStatus(job.id, 'open')}
                              >
                                {t('admin.jobs.activate') || 'Activate/Approve'}
                              </DropdownMenuItem>
                            ) : !(job.is_demo || job.isDemo) &&
                              job.status === 'open' ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateJobStatus(job.id, 'suspended')
                                }
                              >
                                {t('admin.jobs.suspend') || 'Suspend'}
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

      {/* Edit Dialog */}
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

      {/* Generation Config Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('admin.jobs.generate.title') || 'Ad Generator'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.jobs.generate.quantity') || 'Quantity'}</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={genQuantity}
                onChange={(e) => setGenQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('admin.jobs.generate.date') || 'Base Creation Date'}
              </Label>
              <Input
                type="date"
                value={genDate}
                onChange={(e) => setGenDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {t('admin.jobs.generate.categories') || 'Categories'}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setGenCategories(
                      genCategories.length === categories.length
                        ? []
                        : [...categories],
                    )
                  }
                >
                  {genCategories.length === categories.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              </div>
              <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center space-x-2 mb-3"
                  >
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={genCategories.some((c) => c.id === cat.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setGenCategories([...genCategories, cat])
                        } else {
                          setGenCategories(
                            genCategories.filter((c) => c.id !== cat.id),
                          )
                        }
                      }}
                    />
                    <Label
                      htmlFor={`cat-${cat.id}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {getCategoryLabel(cat.name)}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateModalOpen(false)}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleGenerateConfiguredDemos}
              disabled={generating}
            >
              {generating
                ? t('loading') || 'Generating...'
                : t('admin.jobs.generate.submit') || 'Generate Ads'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
