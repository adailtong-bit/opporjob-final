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
  favorites: string[]
  loading: boolean
  fetchVendors: () => Promise<void>
  fetchFavorites: () => Promise<void>
  addVendor: (vendor: Partial<Vendor>) => Promise<Vendor | null>
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>
  deleteVendor: (id: string) => Promise<void>
  toggleFavorite: (vendorId: string) => Promise<void>
}

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  favorites: [],
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
  fetchFavorites: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('favorites')
      .select('vendor_id')
      .eq('user_id', user.id)
    if (!error && data) {
      set({ favorites: data.map((f: any) => f.vendor_id) })
    }
  },
  addVendor: async (vendor) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('vendors')
      .insert([{ ...vendor, owner_id: user?.id }])
      .select()
      .single()
    if (!error && data) {
      set({ vendors: [...get().vendors, data as Vendor] })
      return data as Vendor
    }
    return null
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
  toggleFavorite: async (vendorId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { favorites } = get()
    const isFavorite = favorites.includes(vendorId)

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('vendor_id', vendorId)
      set({ favorites: favorites.filter((id) => id !== vendorId) })
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: user.id, vendor_id: vendorId }])
      set({ favorites: [...favorites, vendorId] })
    }
  },
}))
