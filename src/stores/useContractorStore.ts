import { create } from 'zustand'

export interface Contractor {
  id: string
  name: string
  email: string
  phone: string
  role: string
  linkedPjId?: string // Optional link to a PJ company (Partner)
  skills: string[]
  status: 'available' | 'busy'
}

interface ContractorState {
  contractors: Contractor[]
  addContractor: (contractor: Omit<Contractor, 'id' | 'status'>) => void
  updateContractor: (id: string, data: Partial<Contractor>) => void
  removeContractor: (id: string) => void
  getContractorsByPartner: (pjId: string) => Contractor[]
}

const mockContractors: Contractor[] = []

export const useContractorStore = create<ContractorState>((set, get) => ({
  contractors: mockContractors,
  addContractor: (data) =>
    set((state) => ({
      contractors: [
        ...state.contractors,
        {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          status: 'available',
        },
      ],
    })),
  updateContractor: (id, data) =>
    set((state) => ({
      contractors: state.contractors.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      ),
    })),
  removeContractor: (id) =>
    set((state) => ({
      contractors: state.contractors.filter((c) => c.id !== id),
    })),
  getContractorsByPartner: (pjId) =>
    get().contractors.filter((c) => c.linkedPjId === pjId),
}))
