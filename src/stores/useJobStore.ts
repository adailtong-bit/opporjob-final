import { create } from 'zustand'

export interface Bid {
  id: string
  jobId: string
  executorId: string
  executorName: string
  amount: number
  description: string
  executorReputation: number
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
  address: any
  budget: number
  ownerId: string
  ownerName: string
  creatorPlan?:
    | 'Básico'
    | 'Bronze'
    | 'Prata'
    | 'Ouro'
    | 'Premium'
    | 'Enterprise'
  status:
    | 'open'
    | 'in_progress'
    | 'completed'
    | 'suspended'
    | 'cancelled'
    | 'dispute'
  createdAt: Date
  publicationDate: Date
  auctionEndDate?: Date
  maxExecutionDeadline?: Date
  premiumType: 'none' | 'region' | 'category'
  projectId?: string
  stageId?: string
  regionCode: string
  contactPhone?: string
  photos?: string[]
  bids: Bid[]
  acceptedBidId?: string
  smartMatchScore?: number
  listingType?: string // 'job', 'product', 'rental', 'community'
  condition?: 'new' | 'like_new' | 'good' | 'fair'
  salePrice?: number
  rentalRate?: number
  rentalRateType?: 'daily' | 'monthly'
  minRentalPeriod?: number
  brand?: string
  model?: string
}

interface JobState {
  jobs: Job[]
  addJob: (job: any) => void
  getJob: (id: string) => Job | undefined
  updateJob: (id: string, job: Partial<Job>) => void
  deleteJob: (id: string) => void
  addBid: (jobId: string, bid: any) => void
  acceptBid: (jobId: string, bidId: string) => void
  completeJob: (jobId: string) => void
  openDispute: (jobId: string) => void
  updateJobStatus: (jobId: string, status: Job['status']) => void
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  addJob: (job) =>
    set((state) => ({
      jobs: [
        {
          ...job,
          id: Math.random().toString(36).substr(2, 9),
          status: 'open',
          createdAt: new Date(),
          bids: [],
        },
        ...state.jobs,
      ],
    })),
  getJob: (id) => get().jobs.find((j) => j.id === id),
  updateJob: (id, job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j)),
    })),
  deleteJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),
  addBid: (jobId, bid) =>
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
    })),
  acceptBid: (jobId, bidId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? { ...j, acceptedBidId: bidId, status: 'in_progress' }
          : j,
      ),
    })),
  completeJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'completed' } : j,
      ),
    })),
  openDispute: (jobId) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'dispute' } : j,
      ),
    })),
  updateJobStatus: (jobId, status) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
    })),
}))
