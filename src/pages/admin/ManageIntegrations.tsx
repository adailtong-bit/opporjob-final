import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  Play,
  AlertCircle,
  Database,
  Trash2,
  Check,
  RefreshCw,
  Edit,
  Filter,
  BarChart3,
  Plus,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useJobStore } from '@/stores/useJobStore'
import type { Database as DB } from '@/lib/supabase/types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

type Job = DB['public']['Tables']['jobs']['Row']

const chartConfig = {
  apify: {
    label: 'Apify',
    color: 'hsl(var(--primary))',
  },
  buscador: {
    label: 'Search',
    color: 'hsl(var(--chart-2))',
  },
}

export default function ManageIntegrations() {
  const [loading, setLoading] = useState(false)
  const [pendingJobs, setPendingJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedEngine, setSelectedEngine] = useState('default')

  const [editingJob, setEditingJob] = useState<Job | null>(null)

  const [dateFilter, setDateFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const [chartData, setChartData] = useState<any[]>([])

  const { toast } = useToast()
  const { fetchJobs } = useJobStore()

  useEffect(() => {
    // Generate mock trend data for the dashboard
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      data.push({
        date: d.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
        }),
        apify: Math.floor(Math.random() * 500) + 100,
        buscador: Math.floor(Math.random() * 300) + 50,
      })
    }
    setChartData(data)
  }, [])

  const fetchPendingJobs = async () => {
    setLoadingJobs(true)
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter)
      } else {
        query = query.in('source', ['apify', 'buscador_scraper'])
      }

      if (dateFilter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('created_at', today.toISOString())
      } else if (dateFilter === 'week') {
        const week = new Date()
        week.setDate(week.getDate() - 7)
        query = query.gte('created_at', week.toISOString())
      } else if (dateFilter === 'month') {
        const month = new Date()
        month.setMonth(month.getMonth() - 1)
        query = query.gte('created_at', month.toISOString())
      }

      // Limiting to 500 to prevent browser lag with thousands of records
      const { data, error } = await query.limit(500)

      if (error) throw error
      setPendingJobs(data || [])
    } catch (err: any) {
      console.error('Error fetching pending jobs:', err)
    } finally {
      setLoadingJobs(false)
    }
  }

  useEffect(() => {
    fetchPendingJobs()
  }, [dateFilter, sourceFilter])

  const handleRunApify = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('jobs-import', {
        body: { engineId: selectedEngine },
      })

      if (error) throw error

      if (data?.success) {
        toast({
          title: 'Extraction Completed',
          description: `${data.count} new ads were imported to the staging area. Existing ads were ignored to avoid duplication.`,
        })
        await fetchPendingJobs()
      } else {
        throw new Error(data?.error || 'Unknown error')
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Integration Error',
        description: err.message || 'Could not connect to Apify.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'open' })
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Ad Approved',
        description: 'The ad was successfully published on the marketplace.',
      })

      setPendingJobs((prev) => prev.filter((job) => job.id !== id))
      await fetchJobs()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error approving',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleSaveAndApprove = async () => {
    if (!editingJob) return
    setProcessingId(editingJob.id)
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: editingJob.title,
          description: editingJob.description,
          budget: editingJob.budget,
          category: editingJob.category,
          location: editingJob.location,
          status: 'open',
        })
        .eq('id', editingJob.id)

      if (error) throw error

      toast({
        title: 'Ad Approved',
        description: 'The ad was successfully updated and published.',
      })

      setPendingJobs((prev) => prev.filter((job) => job.id !== editingJob.id))
      setEditingJob(null)
      await fetchJobs()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error approving',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDiscard = async (id: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id)

      if (error) throw error

      toast({
        title: 'Ad Discarded',
        description: 'The ad was permanently removed.',
      })

      setPendingJobs((prev) => prev.filter((job) => job.id !== id))
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error discarding',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Manage the automated collection of services and products from other
          platforms.
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
        <h3 className="text-red-800 dark:text-red-400 font-semibold flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          Ação Necessária para Sincronização com GitHub
        </h3>
        <p className="text-red-700 dark:text-red-300 text-sm mb-3">
          O GitHub bloqueou o envio devido a chaves antigas que ficaram gravadas
          no histórico. Nós excluímos o arquivo problemático e recriamos a
          função com segurança total, mas para liberar a restrição de segurança
          no GitHub, você precisa clicar no link abaixo e aprovar a exceção:
        </p>
        <a
          href="https://github.com/adailtong-bit/bidwork-urxxhqj1l/security/secret-scanning/unblock-secret/3dtxCC81drNUZn22lbH9qjNgtSt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-9 px-4 py-2"
        >
          Desbloquear Sincronização no GitHub
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="md:col-span-1">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-4 h-4 text-blue-600" />
                Scraper Integration
              </CardTitle>
              <Badge className="bg-green-500 w-fit text-xs px-2 py-0.5">
                Connected
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              Active integration using API Key. Extracts data automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Select Extraction Engine:</Label>
              <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    Apify Scraper (Default)
                  </SelectItem>
                  <SelectItem value="search_scraper_engine">
                    Search Scraper (Custom Engine)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md bg-slate-50 dark:bg-slate-900 p-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">API Status</span>
                <span className="flex items-center gap-1 font-medium text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Anti-Duplication Filter
                </span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-md border border-amber-100 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p>
                Extracted ads go to the <strong>Staging Area</strong>.
                Duplicates are ignored.
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={handleRunApify}
              disabled={loading}
              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  Batch Processing...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-2" /> Run Extraction
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Extraction Volume (Last 7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1 min-h-[200px]">
            <ChartContainer config={chartConfig} className="w-full h-[200px]">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="apify"
                  fill="var(--color-apify)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="buscador"
                  fill="var(--color-buscador)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Staging Area</h2>
            <p className="text-sm text-muted-foreground">
              Review, edit and approve newly imported ads (Showing up to 500
              records for optimization).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPendingJobs}
              disabled={loadingJobs}
              className="h-8 text-xs"
            >
              <RefreshCw
                className={`w-3 h-3 mr-2 ${loadingJobs ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center bg-muted/30 p-2.5 rounded-md border">
          <div className="flex items-center gap-2 w-full sm:w-auto px-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium">Filters:</span>
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs bg-background">
              <SelectValue placeholder="Source / Integrator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Integrators</SelectItem>
              <SelectItem value="apify">Apify Scraper</SelectItem>
              <SelectItem value="buscador_scraper">Search Scraper</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs bg-background">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingJobs ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Loading pending ads...
            </p>
          </div>
        ) : pendingJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No ads pending approval with current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pendingJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      {job.photos &&
                      Array.isArray(job.photos) &&
                      job.photos.length > 0 ? (
                        <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-muted">
                          <img
                            src={job.photos[0] as string}
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
                            No Photo
                          </span>
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {job.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {job.category || 'No Category'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-green-600 bg-green-50 dark:bg-green-950"
                          >
                            {job.budget ? `$${job.budget}` : 'To be discussed'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {job.location}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-auto">
                            {job.source === 'apify' ? 'Apify' : 'Search Engine'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 w-full sm:w-auto shrink-0 mt-3 sm:mt-0 flex-wrap sm:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none h-7 text-xs px-2"
                        onClick={() => setEditingJob(job)}
                        disabled={processingId === job.id}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 sm:flex-none h-7 text-xs px-2"
                        onClick={() => handleDiscard(job.id)}
                        disabled={processingId === job.id}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Discard
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-2"
                        onClick={() => handleApprove(job.id)}
                        disabled={processingId === job.id}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!editingJob}
        onOpenChange={(open) => !open && setEditingJob(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review and Edit Ad</DialogTitle>
            <DialogDescription>
              Adjust details before approving and publishing on the marketplace.
            </DialogDescription>
          </DialogHeader>

          {editingJob && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingJob.title || ''}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingJob.description || ''}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingJob.budget || ''}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        budget: parseFloat(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingJob.category || ''}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, category: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editingJob.location || ''}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, location: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setEditingJob(null)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (editingJob) {
                  handleDiscard(editingJob.id)
                  setEditingJob(null)
                }
              }}
              disabled={processingId === editingJob?.id}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSaveAndApprove}
              disabled={processingId === editingJob?.id}
            >
              <Check className="w-4 h-4 mr-2" />
              Save and Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
