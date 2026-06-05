import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { useNotificationStore } from './useNotificationStore'
import { useAuthStore } from './useAuthStore'
import { useConstructionPlansStore } from './useConstructionPlansStore'

export interface Bid {
  id: string
  jobId: string
  executorId: string
  executorName: string
  amount: number
  description: string
  executorReputation?: number
  createdAt: Date
}

export interface Job {
  id: string
  title: string
  description: string
  type: 'fixed' | 'auction'
  category: string
  subCategory?: string
  location: string
  address?: any
  budget: number
  ownerId: string
  ownerName: string
  creatorPlan?: string
  status:
    | 'open'
    | 'in_progress'
    | 'completed'
    | 'suspended'
    | 'cancelled'
    | 'dispute'
  createdAt: Date
  publicationDate?: Date
  auctionEndDate?: Date
  maxExecutionDeadline?: Date
  premiumType?: 'none' | 'region' | 'category'
  projectId?: string
  stageId?: string
  regionCode?: string
  contactPhone?: string
  photos?: string[]
  bids: Bid[]
  acceptedBidId?: string
  smartMatchScore?: number
  listingType?: string
  condition?: 'new' | 'like_new' | 'good' | 'fair'
  salePrice?: number
  rentalRate?: number
  rentalRateType?: 'daily' | 'monthly'
  minRentalPeriod?: number
  brand?: string
  model?: string
  source?: string
  externalId?: string
  completionPhotos?: string[]
  completionComments?: string
  viewsCount?: number
  impressionsCount?: number
  isDemo?: boolean
  priorityWeight?: number
  earlyAccessHours?: number
}

interface JobState {
  jobs: Job[]
  loading: boolean
  fetchJobs: () => Promise<void>
  addJob: (job: any) => Promise<any>
  getJob: (id: string) => Job | undefined
  updateJob: (id: string, job: Partial<Job>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  addBid: (jobId: string, bid: any) => Promise<void>
  acceptBid: (jobId: string, bidId: string) => Promise<void>
  completeJob: (jobId: string) => Promise<void>
  finalizeJob: (
    jobId: string,
    payload: { completionPhotos: string[]; completionComments: string },
  ) => Promise<void>
  openDispute: (jobId: string) => Promise<void>
  updateJobStatus: (jobId: string, status: Job['status']) => Promise<void>
  incrementView: (jobId: string) => Promise<void>
  incrementImpressions: (jobIds: string[]) => Promise<void>
  fetchJobById: (id: string) => Promise<Job | undefined>
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  loading: false,
  fetchJobs: async () => {
    set({ loading: true })

    const isProd =
      typeof window !== 'undefined' &&
      window.location.hostname === 'opporjob.com'

    let query = supabase.from('jobs').select('*, bids!bids_job_id_fkey(*)')

    if (isProd) {
      query = query.eq('is_demo', false)
    }

    const { data: jobsData, error } = await query
      .order('priority_weight', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (!error && jobsData) {
      const authState = useAuthStore.getState()
      const currentUser = authState.user
      const isPremium = currentUser?.isPremium || currentUser?.role === 'admin'
      const now = new Date()

      const { plans } = useConstructionPlansStore.getState()
      const userPlan = plans.find((p) => p.name === currentUser?.planName)
      const userEarlyAccessHours = userPlan?.earlyAccessHours || 0

      const formattedJobs = jobsData
        .map((d: any) => ({
          ...d,
          id: d.id,
          title: d.title,
          description: d.description,
          type: d.type || 'fixed',
          category: d.category,
          subCategory: d.sub_category,
          location: d.location,
          budget: d.budget,
          ownerId: d.owner_id,
          ownerName: d.owner_name,
          status: d.status || 'open',
          source: d.source,
          externalId: d.external_id,
          photos: d.photos || [],
          listingType: d.listing_type,
          acceptedBidId: d.accepted_bid_id,
          completionPhotos: d.completion_photos || [],
          completionComments: d.completion_comments,
          viewsCount: d.views_count || 0,
          impressionsCount: d.impressions_count || 0,
          isDemo: d.is_demo || false,
          priorityWeight: d.priority_weight || 1,
          earlyAccessHours: d.early_access_hours || 0,
          createdAt: new Date(d.created_at),
          bids: (d.bids || []).map((b: any) => ({
            id: b.id,
            jobId: b.job_id,
            executorId: b.executor_id,
            executorName: b.executor_name,
            amount: b.amount,
            description: b.description,
            createdAt: new Date(b.created_at),
          })),
        }))
        .filter((j: Job) => {
          if (isPremium) return true
          if (currentUser && j.ownerId === currentUser.id) return true
          if (j.earlyAccessHours && j.earlyAccessHours > 0) {
            if (userEarlyAccessHours < j.earlyAccessHours) {
              const hoursSinceCreation =
                (now.getTime() - j.createdAt.getTime()) / (1000 * 60 * 60)
              if (hoursSinceCreation < j.earlyAccessHours) {
                return false
              }
            }
          }
          return true
        })
      set({ jobs: formattedJobs, loading: false })
    } else {
      set({ loading: false })
    }
  },
  addJob: async (job) => {
    const currentUser = useAuthStore.getState().user
    let priorityWeight = 1
    let earlyAccessHours = 0

    if (currentUser && currentUser.planName) {
      const plans = useConstructionPlansStore.getState().plans
      const activePlan = plans.find((p) => p.name === currentUser.planName)
      if (activePlan) {
        priorityWeight = activePlan.priorityWeight || 1
        earlyAccessHours = activePlan.earlyAccessHours || 0
      } else if (currentUser.role === 'admin' || currentUser.isPremium) {
        priorityWeight = 10
        earlyAccessHours = 24
      }
    }

    const payload: any = {
      title: job.title,
      description: job.description,
      type: job.pricingType || 'fixed',
      listing_type: job.listingType,
      category: job.category,
      sub_category: job.subCategory,
      location: job.location,
      budget: job.budget,
      owner_id: job.ownerId || null,
      owner_name: job.ownerName || 'Visitante',
      status: 'open',
      photos: job.photos || [],
      source: 'internal',
      priority_weight: priorityWeight,
      early_access_hours: earlyAccessHours,
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([payload])
      .select()

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      await get().fetchJobs()
      return data[0]
    }

    return null
  },
  getJob: (id) => {
    const job = get().jobs.find((j) => j.id === id)
    if (!job) return undefined
    const isProd =
      typeof window !== 'undefined' &&
      window.location.hostname === 'opporjob.com'
    if (isProd && (job.isDemo || (job as any).is_demo)) return undefined
    return job
  },
  updateJob: async (id, job) => {
    const updateData: any = {}
    if (job.title) updateData.title = job.title
    if (job.description) updateData.description = job.description
    if (job.status) updateData.status = job.status
    if (job.budget) updateData.budget = job.budget
    if (job.photos) updateData.photos = job.photos

    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j)),
    }))

    if (Object.keys(updateData).length > 0) {
      await supabase.from('jobs').update(updateData).eq('id', id)
      await get().fetchJobs()
    }
  },
  deleteJob: async (id) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    }))
    await supabase.from('jobs').delete().eq('id', id)
    await get().fetchJobs()
  },
  addBid: async (jobId, bid) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              bids: [
                ...j.bids,
                {
                  ...bid,
                  id: Math.random().toString(36).substr(2, 9),
                  createdAt: new Date(),
                },
              ],
            }
          : j,
      ),
    }))

    const { error } = await supabase.from('bids').insert([
      {
        job_id: jobId,
        executor_id: bid.executorId,
        executor_name: bid.executorName,
        amount: bid.amount,
        description: bid.description,
      },
    ])
    if (!error) {
      await get().fetchJobs()
    }
  },
  acceptBid: async (jobId, bidId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? { ...j, acceptedBidId: bidId, status: 'in_progress' }
          : j,
      ),
    }))
    await supabase.rpc('award_job', {
      job_id_param: jobId,
      bid_id_param: bidId,
    })
    await get().fetchJobs()
  },
  completeJob: async (jobId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'completed' } : j,
      ),
    }))
    await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId)
    await get().fetchJobs()
  },
  finalizeJob: async (jobId, payload) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'completed',
              completionPhotos: payload.completionPhotos,
              completionComments: payload.completionComments,
            }
          : j,
      ),
    }))

    const { data: updatedJob } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        completion_photos: payload.completionPhotos,
        completion_comments: payload.completionComments,
      })
      .eq('id', jobId)
      .select('id, owner_id, title')
      .single()

    if (updatedJob && updatedJob.owner_id) {
      const message = `Your job '${updatedJob.title}' has been completed. A new invoice is ready for payment.`

      useNotificationStore.getState().addNotification({
        userId: updatedJob.owner_id,
        title: 'Job Completed',
        message: message,
        type: 'info',
        link: `/jobs/${jobId}`,
      })

      supabase.functions.invoke('send-push', {
        body: {
          userId: updatedJob.owner_id,
          title: 'Job Completed',
          body: message,
          url: `/jobs/${jobId}`,
        },
      })
    }

    await get().fetchJobs()
  },
  openDispute: async (jobId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'dispute' } : j,
      ),
    }))
    await supabase.from('jobs').update({ status: 'dispute' }).eq('id', jobId)
    await get().fetchJobs()
  },
  updateJobStatus: async (jobId, status) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
    }))
    await supabase.from('jobs').update({ status }).eq('id', jobId)
    await get().fetchJobs()
  },
  incrementView: async (jobId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, viewsCount: (j.viewsCount || 0) + 1 } : j,
      ),
    }))
    await supabase.rpc('increment_job_view', { job_id_param: jobId })
  },
  incrementImpressions: async (jobIds) => {
    if (!jobIds || jobIds.length === 0) return
    set((state) => ({
      jobs: state.jobs.map((j) =>
        jobIds.includes(j.id)
          ? { ...j, impressionsCount: (j.impressionsCount || 0) + 1 }
          : j,
      ),
    }))
    await supabase.rpc('increment_job_impressions', { job_ids_param: jobIds })
  },
  fetchJobById: async (id) => {
    const isProd =
      typeof window !== 'undefined' &&
      window.location.hostname === 'opporjob.com'

    let query = supabase
      .from('jobs')
      .select('*, bids!bids_job_id_fkey(*)')
      .eq('id', id)

    if (isProd) {
      query = query.eq('is_demo', false)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return undefined
    }

    const formattedJob: Job = {
      ...data,
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type || 'fixed',
      category: data.category,
      subCategory: data.sub_category,
      location: data.location,
      budget: data.budget,
      ownerId: data.owner_id,
      ownerName: data.owner_name,
      status: data.status || 'open',
      source: data.source,
      externalId: data.external_id,
      photos: data.photos || [],
      listingType: data.listing_type,
      acceptedBidId: data.accepted_bid_id,
      completionPhotos: data.completion_photos || [],
      completionComments: data.completion_comments,
      viewsCount: data.views_count || 0,
      impressionsCount: data.impressions_count || 0,
      isDemo: data.is_demo || false,
      priorityWeight: data.priority_weight || 1,
      earlyAccessHours: data.early_access_hours || 0,
      createdAt: new Date(data.created_at),
      bids: (data.bids || []).map((b: any) => ({
        id: b.id,
        jobId: b.job_id,
        executorId: b.executor_id,
        executorName: b.executor_name,
        amount: b.amount,
        description: b.description,
        createdAt: new Date(b.created_at),
      })),
    }

    const authState = useAuthStore.getState()
    const currentUser = authState.user
    const isPremium = currentUser?.isPremium || currentUser?.role === 'admin'
    const now = new Date()
    const { plans } = useConstructionPlansStore.getState()
    const userPlan = plans.find((p) => p.name === currentUser?.planName)
    const userEarlyAccessHours = userPlan?.earlyAccessHours || 0

    if (
      !isPremium &&
      currentUser?.id !== formattedJob.ownerId &&
      formattedJob.earlyAccessHours! > 0
    ) {
      if (userEarlyAccessHours < formattedJob.earlyAccessHours!) {
        const hoursSinceCreation =
          (now.getTime() - formattedJob.createdAt.getTime()) / (1000 * 60 * 60)
        if (hoursSinceCreation < formattedJob.earlyAccessHours!) {
          return undefined
        }
      }
    }

    set((state) => {
      const exists = state.jobs.some((j) => j.id === id)
      if (!exists) {
        return { jobs: [...state.jobs, formattedJob] }
      }
      return {
        jobs: state.jobs.map((j) => (j.id === id ? formattedJob : j)),
      }
    })

    return formattedJob
  },
}))
