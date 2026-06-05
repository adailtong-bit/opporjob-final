import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface VendorContact {
  id?: string
  vendor_id?: string
  name: string
  email: string | null
  phone: string | null
  role: string
}

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
  company_name: string | null
  tax_id: string | null
  financial_email: string | null
  job_title: string | null
  complement?: string | null
  created_at: string
  vendor_contacts?: VendorContact[]
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
      .select('*, vendor_contacts(*)')
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

    const { vendor_contacts, ...vendorData } = vendor

    const { data, error } = await supabase
      .from('vendors')
      .insert([{ ...vendorData, owner_id: user?.id } as any])
      .select()
      .single()

    if (!error && data) {
      let insertedContacts: any[] = []
      if (vendor_contacts && vendor_contacts.length > 0) {
        const contactsToInsert = vendor_contacts.map((c) => ({
          vendor_id: data.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          role: c.role,
        }))
        const { data: contactsData } = await supabase
          .from('vendor_contacts')
          .insert(contactsToInsert)
          .select()
        if (contactsData) insertedContacts = contactsData
      }

      const newVendor = { ...data, vendor_contacts: insertedContacts } as Vendor
      set({ vendors: [...get().vendors, newVendor] })
      return newVendor
    }
    return null
  },
  updateVendor: async (id, vendor) => {
    const { vendor_contacts, ...vendorData } = vendor

    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData as any)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      let updatedContacts: any[] = []

      if (vendor_contacts) {
        await supabase.from('vendor_contacts').delete().eq('vendor_id', id)

        if (vendor_contacts.length > 0) {
          const contactsToInsert = vendor_contacts.map((c) => ({
            vendor_id: id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            role: c.role,
          }))
          const { data: contactsData } = await supabase
            .from('vendor_contacts')
            .insert(contactsToInsert)
            .select()
          if (contactsData) updatedContacts = contactsData
        }
      } else {
        const { data: existingContacts } = await supabase
          .from('vendor_contacts')
          .select('*')
          .eq('vendor_id', id)
        updatedContacts = existingContacts || []
      }

      const updatedVendor = {
        ...data,
        vendor_contacts: updatedContacts,
      } as Vendor
      set({
        vendors: get().vendors.map((v) => (v.id === id ? updatedVendor : v)),
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
