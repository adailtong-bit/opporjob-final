import { create } from 'zustand'

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
  | 'other'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  translationKey?: string
  subCategories: SubCategory[]
}

interface CategoryState {
  categories: Category[]
  addCategory: (name: string, type?: CategoryType) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string, type?: CategoryType) => void
  addSubCategory: (categoryId: string, name: string) => void
  removeSubCategory: (categoryId: string, subId: string) => void
  updateSubCategory: (categoryId: string, subId: string, name: string) => void
}

const createSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

const createSubCat = (name: string, translationKey?: string): SubCategory => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  slug: createSlug(name),
  translationKey,
})

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [
    {
      id: '1',
      name: 'Renovations',
      slug: 'renovations',
      type: 'job',
      translationKey: 'category.reform',
      subCategories: [
        createSubCat('Painting', 'subcat.painting'),
        createSubCat('Drywall Installation', 'subcat.drywall'),
        createSubCat('Cabinet Installation', 'subcat.cabinets'),
        createSubCat('Electrician', 'subcat.electrician'),
        createSubCat('Flooring Installer', 'subcat.flooring'),
      ],
    },
    {
      id: '2',
      name: 'Construction',
      slug: 'construction',
      type: 'job',
      translationKey: 'category.construction',
      subCategories: [
        createSubCat('Masonry', 'subcat.masonry'),
        createSubCat('Roofing', 'subcat.roofing'),
        createSubCat('Foundation', 'subcat.foundation'),
        createSubCat('Ironwork', 'subcat.ironwork'),
      ],
    },
    {
      id: '3',
      name: 'IT & Programming',
      slug: 'it-programming',
      type: 'job',
      translationKey: 'category.ti',
      subCategories: [
        createSubCat('Web Development', 'subcat.webdev'),
        createSubCat('Mobile Apps', 'subcat.mobile'),
        createSubCat('UI/UX Design', 'subcat.uiux'),
        createSubCat('IT Support', 'subcat.itsupport'),
      ],
    },
    {
      id: '4',
      name: 'Design',
      slug: 'design',
      type: 'job',
      translationKey: 'category.design',
      subCategories: [
        createSubCat('Visual Identity', 'subcat.visualid'),
        createSubCat('Web Design', 'subcat.webdesign'),
        createSubCat('Illustration', 'subcat.illustration'),
      ],
    },
    {
      id: '5',
      name: 'Marketing',
      slug: 'marketing',
      type: 'job',
      translationKey: 'category.marketing',
      subCategories: [
        createSubCat('SEO', 'subcat.seo'),
        createSubCat('Traffic Management', 'subcat.traffic'),
        createSubCat('Social Media', 'subcat.socialmedia'),
      ],
    },
    {
      id: '6',
      name: 'Sales & Products',
      slug: 'sales-products',
      type: 'marketplace',
      translationKey: 'category.sales',
      subCategories: [
        createSubCat('Electronics', 'subcat.electronics'),
        createSubCat('Furniture', 'subcat.furniture'),
        createSubCat('Tools', 'subcat.tools'),
      ],
    },
    {
      id: '7',
      name: 'Rentals',
      slug: 'rentals',
      type: 'rental',
      translationKey: 'category.rental',
      subCategories: [
        createSubCat('Equipment', 'subcat.equipment'),
        createSubCat('Vehicles', 'subcat.vehicles'),
        createSubCat('Spaces', 'subcat.spaces'),
      ],
    },
    {
      id: '8',
      name: 'Donation',
      slug: 'donation',
      type: 'donation',
      translationKey: 'category.donation',
      subCategories: [
        createSubCat('Leftover Materials', 'subcat.leftovers'),
        createSubCat('Clothes & PPE', 'subcat.clothes_ppe'),
      ],
    },
  ],
  addCategory: (name, type = 'job') =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          id: Math.random().toString(36).substr(2, 9),
          name,
          slug: createSlug(name),
          type,
          subCategories: [],
        },
      ],
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  updateCategory: (id, name, type) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? { ...c, name, slug: createSlug(name), type: type || c.type }
          : c,
      ),
    })),
  addSubCategory: (categoryId, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subCategories: [...c.subCategories, createSubCat(name)] }
          : c,
      ),
    })),
  removeSubCategory: (categoryId, subId) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.filter((s) => s.id !== subId),
            }
          : c,
      ),
    })),
  updateSubCategory: (categoryId, subId, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.id === subId ? { ...s, name, slug: createSlug(name) } : s,
              ),
            }
          : c,
      ),
    })),
}))
