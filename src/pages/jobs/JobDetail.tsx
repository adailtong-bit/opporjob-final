import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, DollarSign, Eye, Briefcase, ChevronLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setJob(data)
      } catch (error: any) {
        toast({
          title: 'Error loading job',
          description: error.message,
          variant: 'destructive',
        })
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id, navigate, toast])

  useEffect(() => {
    if (!id) return

    const trackJobView = async () => {
      try {
        // Replaced .catch() with async/await and error destructuring to prevent TypeError
        const { error } = await supabase.rpc('increment_job_view', {
          job_id_param: id,
        })
        if (error) {
          console.error('Error tracking job view:', error)
        }
      } catch (err) {
        console.error('Unexpected error tracking job view:', err)
      }
    }

    trackJobView()
  }, [id])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Job not found</h2>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4 text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1 text-slate-400" />
                {job.category || 'Uncategorized'}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1 text-slate-400" />
                {job.views_count || 0} views
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={job.status === 'open' ? 'default' : 'secondary'}
              className="capitalize text-sm"
            >
              {job.status?.replace('_', ' ') || 'Open'}
            </Badge>
            <div className="text-2xl font-bold text-slate-900 flex items-center">
              <DollarSign className="w-5 h-5 text-slate-400" />
              {job.budget || 'Negotiable'}
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-slate-700 whitespace-pre-wrap mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Description
          </h3>
          {job.description || 'No detailed description provided for this job.'}
        </div>

        {job.photos && job.photos.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Photos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {job.photos.map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Job photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
