import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Vendor } from './useVendorStore'

export interface AdCampaign {
  id: string
  advertiser_id: string
  title: string
  media_url: string
  target_url: string
  status: 'draft' | 'active' | 'expired' | 'canceled'
  tier: string
  specifications: Record<string, any>
  start_date: string
  end_date: string
  price: number
  created_at: string
  updated_at: string
  advertiser?: Vendor
}

interface AdState {
  ads: AdCampaign[]
  isLoading: boolean
  fetchAds: () => Promise<void>
  addAd: (ad: Partial<AdCampaign>) => Promise<void>
  updateAd: (id: string, updates: Partial<AdCampaign>) => Promise<void>
  deleteAd: (id: string) => Promise<void>
  checkExpirations: () => AdCampaign[]
  getAdsBySegment: (segment: string, isPaidUser?: boolean) => any[] // Compatibility mapping
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [],
  isLoading: false,
  fetchAds: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('advertising_campaigns')
      .select(
        `
      *,
      advertiser:vendors (*)
    `,
      )
      .order('created_at', { ascending: false })

    if (!error && data) {
      set({ ads: data as AdCampaign[], isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
  addAd: async (ad) => {
    const { data, error } = await supabase
      .from('advertising_campaigns')
      .insert([ad])
      .select(
        `
      *,
      advertiser:vendors (*)
    `,
      )
      .single()
    if (!error && data) {
      set((state) => ({ ads: [data as AdCampaign, ...state.ads] }))
    } else {
      console.error('Error adding ad:', error)
    }
  },
  updateAd: async (id, updates) => {
    const { data, error } = await supabase
      .from('advertising_campaigns')
      .update(updates)
      .eq('id', id)
      .select(
        `
      *,
      advertiser:vendors (*)
    `,
      )
      .single()
    if (!error && data) {
      set((state) => ({
        ads: state.ads.map((a) => (a.id === id ? (data as AdCampaign) : a)),
      }))
    }
  },
  deleteAd: async (id) => {
    const { error } = await supabase
      .from('advertising_campaigns')
      .delete()
      .eq('id', id)
    if (!error) {
      set((state) => ({ ads: state.ads.filter((a) => a.id !== id) }))
    }
  },
  checkExpirations: () => {
    const { ads, updateAd } = get()
    const now = new Date()
    const expiredAds: AdCampaign[] = []

    ads.forEach((ad) => {
      if (
        ad.status === 'active' &&
        ad.end_date &&
        new Date(ad.end_date) < now
      ) {
        expiredAds.push({ ...ad, status: 'expired' })
        updateAd(ad.id, { status: 'expired' })
      }
    })

    return expiredAds
  },
  getAdsBySegment: (segment, isPaidUser = false) => {
    const { ads } = get()
    const now = new Date()

    const validAds = ads.filter((ad) => {
      return (
        ad.status === 'active' && ad.end_date && new Date(ad.end_date) >= now
      )
    })

    return validAds
      .map(
        (ad) =>
          ({
            id: ad.id,
            title: ad.title,
            imageUrl: ad.media_url,
            link: ad.target_url,
            active: ad.status === 'active',
            status: ad.status,
            planLevel: ad.tier,
            calculatedPrice: ad.price,
            startDate: ad.start_date ? new Date(ad.start_date) : new Date(),
            endDate: ad.end_date ? new Date(ad.end_date) : new Date(),
            advertiserName: ad.advertiser?.name || 'Unknown',
            segment: ad.specifications?.segment || 'all',
            createdAt: new Date(ad.created_at),
            skillWeight: 1,
          }) as any,
      )
      .slice(0, 2)
  },
}))
