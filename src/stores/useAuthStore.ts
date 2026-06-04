import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export type TeamRole =
  | 'Admin'
  | 'Project Manager'
  | 'Accountant'
  | 'Collaborator'
  | 'Financial'
  | 'Manager'
  | 'Document Management'
  | 'License Manager'

export interface TeamMember {
  id: string
  name: string
  role: TeamRole
  email: string
  avatar: string
  status: 'active' | 'inactive' | 'busy'
  performance: number
}

export interface LoyaltyTransaction {
  id: string
  date: Date
  description: string
  points: number
  type: 'earned' | 'redeemed'
}

export interface Badge {
  id: string
  name: string
  icon: string // Lucide icon name or url
  description: string
  earnedAt: Date
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: 'BR' | 'US'
}

export interface ConstructionSubscription {
  active: boolean
  basePrice: number
  franchiseeMarkup: number
  projectLimit: number
  activeProjects: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  taxId?: string // CPF or CNPJ
  avatar?: string
  role: 'contractor' | 'executor' | 'admin' | 'partner'
  teamRole?: TeamRole
  entityType: 'pf' | 'pj'
  companyName?: string // For PJ
  businessArea?: string
  category?: string
  reputation: number
  address?: Address
  bankingDetails?: {
    bank: string
    agency: string
    account: string
    document: string
  }
  serviceRadius: number
  location: string
  pendingEvaluation?: {
    jobId: string
    targetId: string
    targetName: string
    type: 'contractor_to_executor' | 'executor_to_contractor'
  }
  isPremium: boolean
  subscriptionTier: 'free' | 'pro' | 'business'
  planName?: 'Básico' | 'Bronze' | 'Prata' | 'Ouro' | 'Premium' | 'Enterprise'
  constructionSubscription?: ConstructionSubscription
  credits: number
  isVerified: boolean
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
  loyaltyPoints: number
  loyaltyHistory: LoyaltyTransaction[]
  teamMembers?: TeamMember[]
  badges: Badge[]
  openChat: boolean
  notificationPreferences?: {
    emailInterests: boolean
    pushInterests: boolean
  }
}

export interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: 'contractor' | 'executor' | 'partner'
  entityType: 'pf' | 'pj'
  businessArea?: string
  category?: string
  address: Address
  taxId?: string
  bankingDetails?: {
    bank: string
    agency: string
    account: string
    document: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setDomainUser: (user: Partial<User> | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateUserReputation: (newScore: number) => void
  updateSettings: (settings: Partial<User>) => void
  clearPendingEvaluation: () => void
  setPendingEvaluation: (evaluation: User['pendingEvaluation']) => void
  buyCredits: (amount: number) => void
  upgradeSubscription: (tier: 'pro' | 'business') => void
  activateConstructionSubscription: (details?: {
    limit: number
    price: number
  }) => void
  submitKYC: (file: File) => Promise<void>
  addTeamMember: (
    member: Omit<TeamMember, 'id' | 'avatar' | 'performance'>,
  ) => void
  removeTeamMember: (id: string) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setDomainUser: (userData) => {
    if (!userData) {
      set({ user: null, isAuthenticated: false })
      return
    }

    set({
      isAuthenticated: true,
      user: {
        id: userData.id || Math.random().toString(36).substr(2, 9),
        name: userData.name || 'Usuário',
        email: userData.email || '',
        role: userData.role || 'contractor',
        entityType: userData.entityType || 'pf',
        reputation: userData.reputation || 4.8,
        serviceRadius: userData.serviceRadius || 50,
        location: userData.location || 'São Paulo - SP',
        isPremium: userData.isPremium || false,
        subscriptionTier: userData.subscriptionTier || 'free',
        planName: userData.planName || 'Básico',
        credits: userData.credits || 100,
        isVerified: userData.isVerified || true,
        kycStatus: userData.kycStatus || 'verified',
        loyaltyPoints: userData.loyaltyPoints || 1250,
        loyaltyHistory: userData.loyaltyHistory || [],
        badges: userData.badges || [],
        openChat: userData.openChat || false,
        teamMembers: userData.teamMembers || [],
        address: userData.address || {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'BR',
        },
        ...userData,
      } as User,
    })
  },
  login: async (email, password) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      set({ isLoading: false })
      throw error
    }
    set({ isLoading: false })
  },
  register: async (data) => {
    set({ isLoading: true })
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    })
    if (error) {
      set({ isLoading: false })
      throw error
    }

    if (authData.user) {
      await supabase
        .from('profiles')
        .update({
          phone: data.phone,
          tax_id: data.taxId,
          company_name: data.entityType === 'pj' ? data.name : null,
          entity_type: data.entityType,
          role: data.role,
        })
        .eq('id', authData.user.id)
    }

    set({ isLoading: false })
  },
  logout: async () => {
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  updateUserReputation: (newScore) =>
    set((state) => ({
      user: state.user ? { ...state.user, reputation: newScore } : null,
    })),
  updateSettings: async (settings) => {
    const currentUser = get().user
    if (!currentUser) return

    set((state) => ({
      user: state.user ? { ...state.user, ...settings } : null,
    }))

    try {
      const updates: any = {}
      if (settings.name !== undefined) updates.name = settings.name
      if (settings.phone !== undefined) updates.phone = settings.phone
      if (settings.taxId !== undefined) updates.tax_id = settings.taxId
      if (settings.companyName !== undefined)
        updates.company_name = settings.companyName

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', currentUser.id)
      }
    } catch (error) {
      console.error('Failed to update settings in Supabase', error)
    }
  },
  clearPendingEvaluation: () =>
    set((state) => ({
      user: state.user ? { ...state.user, pendingEvaluation: undefined } : null,
    })),
  setPendingEvaluation: (evaluation) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, pendingEvaluation: evaluation }
        : null,
    })),
  buyCredits: (amount) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, credits: (state.user.credits || 0) + amount }
        : null,
    })),
  upgradeSubscription: (tier) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, subscriptionTier: tier, isPremium: true }
        : null,
    })),
  activateConstructionSubscription: (details) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            constructionSubscription: {
              active: true,
              basePrice: details?.price || 500,
              franchiseeMarkup: 50,
              projectLimit: details?.limit || 10,
              activeProjects: 0,
            },
          }
        : null,
    })),
  submitKYC: async (file) => {
    set((state) => ({
      user: state.user ? { ...state.user, kycStatus: 'pending' } : null,
    }))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    set((state) => ({
      user: state.user
        ? { ...state.user, kycStatus: 'verified', isVerified: true }
        : null,
    }))
  },
  addTeamMember: (member) =>
    set((state) => {
      if (!state.user) return state
      const currentMembers = state.user.teamMembers || []
      const newMember: TeamMember = {
        ...member,
        id: Math.random().toString(36).substr(2, 9),
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${Math.random()}`,
        performance: 0,
      }
      return {
        user: {
          ...state.user,
          teamMembers: [...currentMembers, newMember],
        },
      }
    }),
  removeTeamMember: (id) =>
    set((state) => {
      if (!state.user || !state.user.teamMembers) return state
      return {
        user: {
          ...state.user,
          teamMembers: state.user.teamMembers.filter((m) => m.id !== id),
        },
      }
    }),
}))
