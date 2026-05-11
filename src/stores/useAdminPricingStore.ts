import {
  useConstructionPlansStore,
  ConstructionPlan,
} from './useConstructionPlansStore'

export type SubscriptionPlan = ConstructionPlan

// Transforma o mock legado num espelho direto do banco real (ConstructionPlans)
// Assim, todos os sistemas passam a ver exatamente a mesma base de planos sincronizada
export const useAdminPricingStore = () => {
  return useConstructionPlansStore()
}
