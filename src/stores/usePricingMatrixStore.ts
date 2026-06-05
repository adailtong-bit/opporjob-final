import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface PricingRules {
  tiers: Record<string, number>
  regions: Record<string, number>
  categories: Record<string, number>
}

interface PricingMatrixState {
  rules: PricingRules
  isLoading: boolean
  fetchRules: () => Promise<void>
  updateRules: (newRules: PricingRules) => Promise<void>
  calculatePrice: (
    tier: string,
    region: string,
    category: string,
    days: number,
  ) => number
}

const defaultRules: PricingRules = {
  tiers: {
    'Tier 3 (Basic)': 50,
    'Tier 2 (Standard)': 100,
    'Tier 1 (Premium)': 200,
    'Tier 0 (Enterprise)': 500,
  },
  regions: { Local: 1.0, National: 1.2, Global: 1.5 },
  categories: {
    Construction: 1.5,
    Maintenance: 1.2,
    General: 1.0,
    Technology: 2.0,
  },
}

export const usePricingMatrixStore = create<PricingMatrixState>((set, get) => ({
  rules: defaultRules,
  isLoading: false,
  fetchRules: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'ads_pricing_matrix')
      .single()
    if (!error && data?.value) {
      set({ rules: data.value as unknown as PricingRules, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
  updateRules: async (newRules) => {
    set({ rules: newRules })
    await supabase
      .from('site_settings')
      .upsert(
        { key: 'ads_pricing_matrix', value: newRules as any },
        { onConflict: 'key' },
      )
  },
  calculatePrice: (tier, region, category, days) => {
    const { rules } = get()
    const base = rules.tiers[tier] || 50
    const rMult = rules.regions[region] || 1
    const cMult = rules.categories[category] || 1
    const months = Math.max(1, Math.ceil(days / 30))
    return base * rMult * cMult * months
  },
}))
