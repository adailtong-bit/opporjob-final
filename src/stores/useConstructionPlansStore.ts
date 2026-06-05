import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface ConstructionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billingCycle: string
  maxProjects: number
  workSize: string
  complexity: string
  features: string[]
  active: boolean
  targetAudience: string
  entityType: string
  validityDays: number
  pushEnabled: boolean
  pushLeadTimeHours: number
  pushMessageText: string
  priorityWeight: number
  earlyAccessHours: number
  visibilityBoost: number
  skillMatchingRule: string
  skillWeight: number
  popular: boolean
}

interface ConstructionPlansState {
  plans: ConstructionPlan[]
  loading: boolean
  fetchPlans: (adminMode?: boolean) => Promise<void>
  addPlan: (plan: Partial<ConstructionPlan>) => Promise<void>
  updatePlan: (id: string, plan: Partial<ConstructionPlan>) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  togglePlanStatus: (id: string) => Promise<void>
}

export const useConstructionPlansStore = create<ConstructionPlansState>(
  (set, get) => ({
    plans: [],
    loading: false,
    fetchPlans: async (adminMode = false) => {
      set({ loading: true })
      let query = supabase
        .from('construction_plans')
        .select('*')
        .order('price', { ascending: true })

      if (!adminMode) {
        query = query.eq('active', true)
      }

      const { data, error } = await query

      if (!error && data) {
        set({
          plans: data.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            price: d.price,
            currency: d.currency || 'USD',
            billingCycle: d.billing_cycle,
            maxProjects: d.max_projects || 0,
            workSize: d.work_size || '',
            complexity: d.complexity || '',
            features: d.features || [],
            active: d.active,
            targetAudience: d.target_audience || 'both',
            entityType: d.entity_type || 'both',
            validityDays: d.validity_days || 30,
            pushEnabled: d.push_enabled || false,
            pushLeadTimeHours: d.push_lead_time_hours || 24,
            pushMessageText: d.push_message_text || '',
            priorityWeight: d.priority_weight || 1,
            earlyAccessHours: d.early_access_hours || 0,
            visibilityBoost: d.visibility_boost || 1,
            skillMatchingRule: d.skill_matching_rule || 'flexible',
            skillWeight: d.skill_weight || 1,
            popular: d.popular || false,
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
          currency: plan.currency || 'USD',
          billing_cycle: plan.billingCycle || 'monthly',
          max_projects: plan.maxProjects || 1,
          work_size: plan.workSize || 'Pequena',
          complexity: plan.complexity || 'Low',
          features: plan.features || [],
          active: plan.active !== false,
          target_audience: plan.targetAudience || 'both',
          entity_type: plan.entityType || 'both',
          validity_days: plan.validityDays || 30,
          push_enabled: plan.pushEnabled || false,
          push_lead_time_hours: plan.pushLeadTimeHours || 24,
          push_message_text: plan.pushMessageText || '',
          priority_weight: plan.priorityWeight || 1,
          early_access_hours: plan.earlyAccessHours || 0,
          visibility_boost: plan.visibilityBoost || 1,
          skill_matching_rule: plan.skillMatchingRule || 'flexible',
          skill_weight: plan.skillWeight || 1,
          popular: plan.popular || false,
        },
      ])
      if (!error) {
        get().fetchPlans(true)
      }
    },
    updatePlan: async (id, plan) => {
      const { error } = await supabase
        .from('construction_plans')
        .update({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          billing_cycle: plan.billingCycle,
          max_projects: plan.maxProjects,
          work_size: plan.workSize,
          complexity: plan.complexity,
          features: plan.features,
          active: plan.active,
          target_audience: plan.targetAudience,
          entity_type: plan.entityType,
          validity_days: plan.validityDays,
          push_enabled: plan.pushEnabled,
          push_lead_time_hours: plan.pushLeadTimeHours,
          push_message_text: plan.pushMessageText,
          priority_weight: plan.priorityWeight,
          early_access_hours: plan.earlyAccessHours,
          visibility_boost: plan.visibilityBoost,
          skill_matching_rule: plan.skillMatchingRule,
          skill_weight: plan.skillWeight,
          popular: plan.popular,
        })
        .eq('id', id)
      if (!error) {
        get().fetchPlans(true)
      }
    },
    deletePlan: async (id) => {
      const { error } = await supabase
        .from('construction_plans')
        .delete()
        .eq('id', id)
      if (!error) {
        get().fetchPlans(true)
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
          get().fetchPlans(true)
        }
      }
    },
  }),
)
