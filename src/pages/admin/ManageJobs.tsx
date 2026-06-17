import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Plus,
  Search,
  Pencil,
  Ban,
  Trash2,
  X,
  CheckCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'

type AdminJob = {
  id: string
  title: string
  description: string
  category: string
  budget: number
  status: string
  created_at: string
  owner_id: string
  owner_name: string
  owner_rating: number
  location?: string
  country?: string
  state?: string
  city?: string
}

type JobFormData = {
  title: string
  description: string
  category: string
  budget: string
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setLocationFilter('')
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    budget: '',
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('admin_get_jobs_with_metrics')
      if (error) throw error
      setJobs(data || [])
    } catch (error: any) {
      console.error('Error fetching jobs metrics:', error)
      // Fallback
      const { data: fallbackData } = await supabase
        .from('jobs')
        .select(
          'id, title, description, category, budget, status, created_at, owner_id, location',
        )
        .order('created_at', { ascending: false })

      setJobs(
        (fallbackData || []).map((j) => ({
          ...j,
          owner_name: 'Unknown',
          owner_rating: 5.0,
        })) as any,
      )

      toast({
        title: 'Notice',
        description:
          'Fetched jobs with partial data due to a metric calculation error.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuspend = async (job: AdminJob) => {
    const newStatus = job.status === 'suspended' ? 'open' : 'suspended'
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', job.id)
      if (error) throw error
      toast({
        title: 'Success',
        description: `Job ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully.`,
      })
      fetchJobs()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update job status.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this job? This action cannot be undone.',
      )
    )
      return
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Success', description: 'Job deleted successfully.' })
      fetchJobs()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete job.',
        variant: 'destructive',
      })
    }
  }

  const handleOpenDialog = (job?: AdminJob) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        budget: job.budget?.toString() || '',
      })
    } else {
      setEditingJob(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        budget: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget) || 0,
      }

      if (editingJob) {
        const { error } = await supabase
          .from('jobs')
          .update(payload)
          .eq('id', editingJob.id)
        if (error) throw error
        toast({ title: 'Success', description: 'Job updated successfully.' })
      } else {
        const { error } = await supabase.from('jobs').insert([
          {
            ...payload,
            status: 'open',
            owner_id: user?.id,
          },
        ])
        if (error) throw error
        toast({ title: 'Success', description: 'Job created successfully.' })
      }

      setIsDialogOpen(false)
      fetchJobs()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save job.',
        variant: 'destructive',
      })
    }
  }

  const filteredJobs = jobs.filter((job) => {
    try {
      const searchLower = search.toLowerCase().trim()
      const matchesSearch =
        !searchLower ||
        String(job.title || '')
          .toLowerCase()
          .includes(searchLower) ||
        String(job.owner_name || '')
          .toLowerCase()
          .includes(searchLower)

      const locLower = locationFilter.toLowerCase().trim()
      const matchesLoc =
        !locLower ||
        String(job.location || '')
          .toLowerCase()
          .includes(locLower) ||
        String(job.city || '')
          .toLowerCase()
          .includes(locLower) ||
        String(job.state || '')
          .toLowerCase()
          .includes(locLower) ||
        String(job.country || '')
          .toLowerCase()
          .includes(locLower)

      const matchesStatus =
        statusFilter === 'all' || job.status === statusFilter

      return matchesSearch && matchesStatus && matchesLoc
    } catch (e) {
      console.error('Filter error on job:', job, e)
      return true
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500">Open</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'suspended':
        return <Badge variant="secondary">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs & Projects</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all marketplace activities.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Job
        </Button>
      </div>

      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl shadow-sm border border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or creator..."
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            placeholder="Filter by Location..."
            className="w-full sm:w-[300px] bg-background/50 border-border/50"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <Button
            variant="ghost"
            className="w-full sm:w-auto text-muted-foreground ml-auto"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-2" /> Clear Filters
          </Button>
        </div>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title & Category</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading jobs...
                </TableCell>
              </TableRow>
            ) : filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="group cursor-pointer hover:bg-muted/30"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[250px]">
                        {job.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {job.category || 'Uncategorized'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col">
                      {job.owner_id ? (
                        <Link
                          to={`/profile/${job.owner_id}`}
                          className="text-primary hover:underline hover:text-primary/80 transition-colors"
                        >
                          {job.owner_name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                      <div className="flex items-center gap-1 font-medium bg-muted/50 w-fit px-1.5 py-0.5 mt-1 rounded text-xs">
                        {job.owner_rating !== undefined &&
                        job.owner_rating !== null
                          ? Number(job.owner_rating).toFixed(1)
                          : '5.0'}
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {[job.city, job.state, job.country]
                        .filter(Boolean)
                        .join(', ') ||
                        job.location ||
                        'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-muted"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleOpenDialog(job)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleSuspend(job)}
                        >
                          {job.status === 'suspended' ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span className="text-green-500">Activate</span>
                            </>
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4 text-orange-500" />
                              <span className="text-orange-500">Suspend</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Create Job'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Job title"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g. Development, Design"
              />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                placeholder="Amount in USD"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Job description"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
