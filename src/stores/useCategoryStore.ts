import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface SubCategory {
  id: string
  name: string
  slug: string
  translationKey?: string
}

export type CategoryType =
  | 'job'
  | 'marketplace'
  | 'rental'
  | 'donation'
  | 'ad'
  | 'other'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  translationKey?: string
  imageUrl?: string
  subCategories: SubCategory[]
}

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  fetchCategories: () => Promise<void>
  addCategory: (
    name: string,
    type?: CategoryType,
    imageUrl?: string,
  ) => Promise<void>
  removeCategory: (id: string) => Promise<void>
  updateCategory: (
    id: string,
    name: string,
    type?: CategoryType,
    imageUrl?: string,
  ) => Promise<void>
  addSubCategory: (categoryId: string, name: string) => Promise<void>
  removeSubCategory: (categoryId: string, subId: string) => Promise<void>
  updateSubCategory: (
    categoryId: string,
    subId: string,
    name: string,
  ) => Promise<void>
}

const createSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

const generateId = () => Math.random().toString(36).substring(2, 15)

const createSubCat = (
  id: string,
  name: string,
  translationKey?: string,
): SubCategory => ({
  id,
  name,
  slug: createSlug(name),
  translationKey,
})

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Renovations',
    slug: 'renovations',
    type: 'job',
    translationKey: 'category.reform',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=home%20renovation',
    subCategories: [
      createSubCat('sub-1-1', 'Painting', 'subcat.painting'),
      createSubCat('sub-1-2', 'Drywall Installation', 'subcat.drywall'),
      createSubCat('sub-1-3', 'Cabinet Installation', 'subcat.cabinets'),
      createSubCat('sub-1-4', 'Electrician', 'subcat.electrician'),
      createSubCat('sub-1-5', 'Flooring Installer', 'subcat.flooring'),
    ],
  },
  {
    id: '2',
    name: 'Construction',
    slug: 'construction',
    type: 'job',
    translationKey: 'category.construction',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=construction%20site',
    subCategories: [
      createSubCat('sub-2-1', 'Masonry', 'subcat.masonry'),
      createSubCat('sub-2-2', 'Roofing', 'subcat.roofing'),
      createSubCat('sub-2-3', 'Foundation', 'subcat.foundation'),
      createSubCat('sub-2-4', 'Ironwork', 'subcat.ironwork'),
    ],
  },
  {
    id: '3',
    name: 'IT & Programming',
    slug: 'it-programming',
    type: 'job',
    translationKey: 'category.ti',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=programming%20code',
    subCategories: [
      createSubCat('sub-3-1', 'Web Development', 'subcat.webdev'),
      createSubCat('sub-3-2', 'Mobile Apps', 'subcat.mobile'),
      createSubCat('sub-3-3', 'UI/UX Design', 'subcat.uiux'),
      createSubCat('sub-3-4', 'IT Support', 'subcat.itsupport'),
    ],
  },
  {
    id: '4',
    name: 'Design',
    slug: 'design',
    type: 'job',
    translationKey: 'category.design',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=web%20design',
    subCategories: [
      createSubCat('sub-4-1', 'Visual Identity', 'subcat.visualid'),
      createSubCat('sub-4-2', 'Web Design', 'subcat.webdesign'),
      createSubCat('sub-4-3', 'Illustration', 'subcat.illustration'),
    ],
  },
  {
    id: '5',
    name: 'Marketing',
    slug: 'marketing',
    type: 'job',
    translationKey: 'category.marketing',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=digital%20marketing',
    subCategories: [
      createSubCat('sub-5-1', 'SEO', 'subcat.seo'),
      createSubCat('sub-5-2', 'Traffic Management', 'subcat.traffic'),
      createSubCat('sub-5-3', 'Social Media', 'subcat.socialmedia'),
    ],
  },
  {
    id: '6',
    name: 'Sales & Products',
    slug: 'sales-products',
    type: 'marketplace',
    translationKey: 'category.sales',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=retail%20products',
    subCategories: [
      createSubCat('sub-6-1', 'Electronics', 'subcat.electronics'),
      createSubCat('sub-6-2', 'Furniture', 'subcat.furniture'),
      createSubCat('sub-6-3', 'Tools', 'subcat.tools'),
    ],
  },
  {
    id: '7',
    name: 'Rentals',
    slug: 'rentals',
    type: 'rental',
    translationKey: 'category.rental',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=equipment%20rental',
    subCategories: [
      createSubCat('sub-7-1', 'Equipment', 'subcat.equipment'),
      createSubCat('sub-7-2', 'Vehicles', 'subcat.vehicles'),
      createSubCat('sub-7-3', 'Spaces', 'subcat.spaces'),
    ],
  },
  {
    id: '8',
    name: 'Donation',
    slug: 'donation',
    type: 'donation',
    translationKey: 'category.donation',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=charity%20donation',
    subCategories: [
      createSubCat('sub-8-1', 'Leftover Materials', 'subcat.leftovers'),
      createSubCat('sub-8-2', 'Clothes & PPE', 'subcat.clothes_ppe'),
    ],
  },
  {
    id: '9',
    name: 'Home Services',
    slug: 'home-services',
    type: 'job',
    translationKey: 'category.home_services',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=home%20services',
    subCategories: [
      createSubCat('sub-9-1', 'Appliance Repair or Maintenance'),
      createSubCat('sub-9-2', 'Carpentry'),
      createSubCat('sub-9-3', 'Concrete and Masonry'),
      createSubCat('sub-9-4', 'Electrical'),
      createSubCat('sub-9-5', 'Exterior Painting'),
      createSubCat('sub-9-6', 'Fence and Gate Installation or Repair'),
      createSubCat('sub-9-7', 'Flooring'),
      createSubCat('sub-9-8', 'Furniture Assembly'),
      createSubCat('sub-9-9', 'General Contracting'),
      createSubCat('sub-9-10', 'Handyman'),
      createSubCat('sub-9-11', 'Home Remodeling'),
      createSubCat('sub-9-12', 'House Cleaning'),
      createSubCat('sub-9-13', 'HVAC Repair or Maintenance'),
      createSubCat('sub-9-14', 'Interior Design'),
      createSubCat('sub-9-15', 'Interior Painting'),
      createSubCat('sub-9-16', 'Junk Removal'),
      createSubCat('sub-9-17', 'Plumbing'),
      createSubCat('sub-9-18', 'Remediation Services'),
      createSubCat(
        'sub-9-19',
        'Swimming Pool Cleaning, Maintenance, and Inspection',
      ),
      createSubCat('sub-9-20', 'TV Mounting'),
      createSubCat('sub-9-21', 'Windows and Doors'),
      createSubCat('sub-9-22', 'Roofing'),
      createSubCat('sub-9-23', 'Welding'),
    ],
  },
  {
    id: '10',
    name: 'Auto Services',
    slug: 'auto-services',
    type: 'job',
    translationKey: 'category.auto_services',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=auto%20repair',
    subCategories: [
      createSubCat('sub-10-1', 'Auto Detailing'),
      createSubCat('sub-10-2', 'Auto Repair or Maintenance'),
      createSubCat('sub-10-3', 'Transportation'),
      createSubCat('sub-10-4', 'Vehicle Towing'),
    ],
  },
  {
    id: '11',
    name: 'Professional & Personal Services',
    slug: 'professional-personal-services',
    type: 'job',
    translationKey: 'category.prof_personal',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=professional%20services',
    subCategories: [
      createSubCat('sub-11-1', 'Academic Tutoring'),
      createSubCat('sub-11-2', 'Accounting and Financial Services'),
      createSubCat('sub-11-3', 'Bartending'),
      createSubCat('sub-11-4', 'Computer and Device Repair'),
      createSubCat('sub-11-5', 'Dog Training'),
      createSubCat('sub-11-6', 'Dog Walking'),
      createSubCat('sub-11-7', 'Event Planning Services'),
      createSubCat('sub-11-8', 'Pet Care'),
      createSubCat('sub-11-9', 'Pet Grooming'),
      createSubCat('sub-11-10', 'Photography'),
      createSubCat('sub-11-11', 'Security and Body Guard Services'),
    ],
  },
]

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: initialCategories,
  isLoading: false,
  fetchCategories: async () => {
    set({ isLoading: true })
    try {
      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
      const { data: subCats, error: subCatsError } = await supabase
        .from('subcategories')
        .select('*')

      if (!catsError && !subCatsError && cats && cats.length > 0) {
        const merged = cats.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          type: c.type as CategoryType,
          translationKey: c.translation_key || undefined,
          imageUrl: c.image_url || undefined,
          subCategories: (subCats || [])
            .filter((s: any) => s.category_id === c.id)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              translationKey: s.translation_key || undefined,
            })),
        }))
        set({ categories: merged })
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e)
    } finally {
      set({ isLoading: false })
    }
  },
  addCategory: async (name, type = 'job', imageUrl?: string) => {
    const id = generateId()
    const slug = createSlug(name)
    const newCat: Category = {
      id,
      name,
      slug,
      type,
      subCategories: [],
      imageUrl: imageUrl || '',
    }

    set((state) => ({ categories: [...state.categories, newCat] }))

    const insertData: any = { id, name, slug, type }
    if (imageUrl) insertData.image_url = imageUrl

    await supabase.from('categories').insert(insertData)
  },
  removeCategory: async (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }))
    await supabase.from('categories').delete().eq('id', id)
  },
  updateCategory: async (id, name, type, imageUrl) => {
    const slug = createSlug(name)
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? {
              ...c,
              name,
              slug,
              type: type || c.type,
              imageUrl: imageUrl !== undefined ? imageUrl : c.imageUrl,
            }
          : c,
      ),
    }))

    const updateData: any = { name, slug }
    if (type) updateData.type = type
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    await supabase.from('categories').update(updateData).eq('id', id)
  },
  addSubCategory: async (categoryId, name) => {
    const id = generateId()
    const slug = createSlug(name)
    const newSub = { id, name, slug }

    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subCategories: [...c.subCategories, newSub] }
          : c,
      ),
    }))

    await supabase.from('subcategories').insert({
      id,
      category_id: categoryId,
      name,
      slug,
    })
  },
  removeSubCategory: async (categoryId, subId) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.filter((s) => s.id !== subId),
            }
          : c,
      ),
    }))

    await supabase.from('subcategories').delete().eq('id', subId)
  },
  updateSubCategory: async (categoryId, subId, name) => {
    const slug = createSlug(name)
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.id === subId ? { ...s, name, slug } : s,
              ),
            }
          : c,
      ),
    }))

    await supabase.from('subcategories').update({ name, slug }).eq('id', subId)
  },
}))
