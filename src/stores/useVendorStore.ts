import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface Vendor {
  id: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
  category: string | null
  status: string | null
  website: string | null
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  pix_key: string | null
  bank_data: any | null
  created_at: string
}

interface VendorState {
  vendors: Vendor[]
  loading: boolean
  fetchVendors: () => Promise<void>
  addVendor: (vendor: Partial<Vendor>) => Promise<void>
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>
  deleteVendor: (id: string) => Promise<void>
}

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  loading: false,
  fetchVendors: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name')
    if (!error && data) {
      set({ vendors: data as Vendor[], loading: false })
    } else {
      set({ loading: false })
    }
  },
  addVendor: async (vendor) => {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendor])
      .select()
      .single()
    if (!error && data) {
      set({ vendors: [...get().vendors, data as Vendor] })
    }
  },
  updateVendor: async (id, vendor) => {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendor)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      set({
        vendors: get().vendors.map((v) => (v.id === id ? (data as Vendor) : v)),
      })
    }
  },
  deleteVendor: async (id) => {
    const { error } = await supabase.from('vendors').delete().eq('id', id)
    if (!error) {
      set({ vendors: get().vendors.filter((v) => v.id !== id) })
    }
  },
}))
