import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface ConstructionPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: string
  maxProjects: number
  workSize: string
  complexity: string
  features: string[]
  active: boolean
  targetAudience: string
}

interface ConstructionPlansState {
  plans: ConstructionPlan[]
  loading: boolean
  fetchPlans: () => Promise<void>
  addPlan: (plan: Partial<ConstructionPlan>) => Promise<void>
  updatePlan: (id: string, plan: Partial<ConstructionPlan>) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  togglePlanStatus: (id: string) => Promise<void>
}

export const useConstructionPlansStore = create<ConstructionPlansState>(
  (set, get) => ({
    plans: [],
    loading: false,
    fetchPlans: async () => {
      set({ loading: true })
      const { data, error } = await supabase
        .from('construction_plans')
        .select('*')
        .order('price', { ascending: true })

      if (!error && data) {
        set({
          plans: data.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            price: d.price,
            billingCycle: d.billing_cycle,
            maxProjects: d.max_projects || 0,
            workSize: d.work_size || '',
            complexity: d.complexity || '',
            features: d.features || [],
            active: d.active,
            targetAudience: d.target_audience || 'contractor',
          })),
          loading: false,
        })
      } else {
        set({ loading: false })
      }
    },
    addPlan: async (plan) => {
      const { error } = await supabase.from('construction_plans').insert([
        {
          name: plan.name || '',
          description: plan.description || '',
          price: plan.price || 0,
          billing_cycle: plan.billingCycle || 'monthly',
          max_projects: plan.maxProjects || 1,
          work_size: plan.workSize || 'Pequena',
          complexity: plan.complexity || 'Low',
          features: plan.features || [],
          active: plan.active !== false,
          target_audience: plan.targetAudience || 'contractor',
        },
      ])
      if (!error) {
        get().fetchPlans()
      }
    },
    updatePlan: async (id, plan) => {
      const { error } = await supabase
        .from('construction_plans')
        .update({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          billing_cycle: plan.billingCycle,
          max_projects: plan.maxProjects,
          work_size: plan.workSize,
          complexity: plan.complexity,
          features: plan.features,
          active: plan.active,
          target_audience: plan.targetAudience,
        })
        .eq('id', id)
      if (!error) {
        get().fetchPlans()
      }
    },
    deletePlan: async (id) => {
      const { error } = await supabase
        .from('construction_plans')
        .delete()
        .eq('id', id)
      if (!error) {
        get().fetchPlans()
      }
    },
    togglePlanStatus: async (id) => {
      const plan = get().plans.find((p) => p.id === id)
      if (plan) {
        const { error } = await supabase
          .from('construction_plans')
          .update({ active: !plan.active })
          .eq('id', id)
        if (!error) {
          get().fetchPlans()
        }
      }
    },
  }),
)
