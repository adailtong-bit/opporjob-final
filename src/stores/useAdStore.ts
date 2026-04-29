import { create } from 'zustand'
import { differenceInDays, differenceInHours } from 'date-fns'
import { usePricingMatrixStore } from './usePricingMatrixStore'

export interface AdvertiserDetails {
  legalAddress: string
  taxId: string
  billingContact: {
    name: string
    email: string
    phone: string
  }
  adContact: {
    name: string
    email: string
    phone: string
  }
}

export interface Ad {
  id: string
  title: string
  imageUrl: string
  type: 'regional' | 'segmented'
  segment: 'dashboard' | 'search' | 'profile' | 'home' | 'all'
  link: string
  active: boolean

  advertiserName: string
  advertiserDetails?: AdvertiserDetails
  planLevel: string
  category: string
  region: string
  country: 'BR' | 'US' | 'Other'
  startDate: Date
  endDate: Date
  status: 'active' | 'suspended' | 'canceled' | 'expired'
  isConstruction: boolean
  calculatedPrice: number
  createdAt: Date
  skillWeight: number

  views: number
  clicks: number
  likes: number
  dislikes: number
}

interface AdState {
  ads: Ad[]
  addAd: (ad: Partial<Ad>) => void
  removeAd: (id: string) => void
  toggleAdStatus: (id: string) => void
  updateAdStatus: (id: string, status: Ad['status']) => void
  extendAd: (id: string, newEndDate: Date) => void
  getAdsBySegment: (segment: string, isPaidUser?: boolean) => Ad[]
  checkExpirations: () => Ad[]
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [],
  addAd: (ad) =>
    set((state) => ({
      ads: [
        ...state.ads,
        {
          ...(ad as Ad),
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),
  removeAd: (id) =>
    set((state) => ({
      ads: state.ads.filter((ad) => ad.id !== id),
    })),
  toggleAdStatus: (id) =>
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id ? { ...ad, active: !ad.active } : ad,
      ),
    })),
  updateAdStatus: (id, status) =>
    set((state) => ({
      ads: state.ads.map((ad) =>
        ad.id === id ? { ...ad, status, active: status === 'active' } : ad,
      ),
    })),
  extendAd: (id, newEndDate) =>
    set((state) => {
      const matrix = usePricingMatrixStore.getState()
      return {
        ads: state.ads.map((ad) => {
          if (ad.id === id) {
            const days = differenceInDays(newEndDate, new Date(ad.endDate))
            let extra = 0
            if (days > 0) {
              extra = matrix.calculatePrice(
                ad.planLevel,
                ad.region,
                ad.category,
                days,
              )
            }
            return {
              ...ad,
              endDate: newEndDate,
              status: 'active',
              active: true,
              calculatedPrice: (ad.calculatedPrice || 0) + extra,
            }
          }
          return ad
        }),
      }
    }),
  getAdsBySegment: (segment, isPaidUser = false) => {
    const { ads } = get()
    const now = new Date()

    const validAds = ads.filter(
      (ad) =>
        ad.active &&
        ad.status === 'active' &&
        new Date(ad.endDate) >= now &&
        (ad.segment === segment || ad.segment === 'all'),
    )

    // Time-Gate logic: 24h block for free users
    const timeGatedAds = validAds.filter((ad) => {
      if (!ad.createdAt) return true
      const hours = differenceInHours(now, new Date(ad.createdAt))
      if (hours < 24 && !isPaidUser) {
        return false
      }
      return true
    })

    // Skill Matrix Priority: Sort by skill weight
    const sorted = [...timeGatedAds].sort((a, b) => {
      const wA = a.skillWeight || 1
      const wB = b.skillWeight || 1
      if (wA !== wB) return wB - wA
      return 0.5 - Math.random() // randomized tie-break
    })

    return sorted.slice(0, 2)
  },
  checkExpirations: () => {
    const { ads } = get()
    const now = new Date()
    const expiredAds: Ad[] = []

    const newAds = ads.map((ad) => {
      if (ad.status === 'active' && new Date(ad.endDate) < now) {
        const expiredAd = { ...ad, status: 'expired' as const, active: false }
        expiredAds.push(expiredAd)
        return expiredAd
      }
      return ad
    })

    if (expiredAds.length > 0) {
      set({ ads: newAds })
    }

    return expiredAds
  },
}))
