import { create } from 'zustand'

export interface Vendor {
  id: string
  name: string
  contact?: string
}

export interface Material {
  id: string
  name: string
  category: string
  price: number
  unit: string
  imageUrl: string
  supplier: string // Default or historical supplier
  stock: number
  description: string
  supplierWebsite?: string
  purchasePermissions?: string[]
}

export interface OrderItem {
  material: Material
  quantity: number
  unitPrice: number
  total: number
  brand?: string
  color?: string
}

export interface Order {
  id: string
  projectId: string
  stageId?: string
  vendorId?: string
  vendorName?: string
  items: OrderItem[]
  total: number
  freightCost?: number
  status:
    | 'pending_manager'
    | 'pending_finance'
    | 'ordered'
    | 'delivered'
    | 'cancelled'
    | 'rejected'
  date: Date
  arrivalDate?: Date
  requesterId?: string
  requesterName?: string
  managerId?: string
  managerName?: string
  managerApprovedAt?: Date
  financeId?: string
  financeName?: string
  financeApprovedAt?: Date
  rejectedBy?: string
  rejectedAt?: Date
  receiptUrl?: string
}

interface MaterialState {
  materials: Material[]
  orders: Order[]
  vendors: Vendor[]
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void
  getMaterials: () => Material[]
  getOrdersByProject: (projectId: string) => Order[]
  updateMaterial: (id: string, data: Partial<Material>) => void
  updateOrderStatus: (
    id: string,
    status: Order['status'],
    actorName?: string,
  ) => void
  updateOrderReceipt: (id: string, receiptUrl: string) => void
  importMaterialList: (
    file: File,
  ) => Promise<{ success: boolean; count: number }>
  addVendor: (vendor: Omit<Vendor, 'id'>) => Vendor
}

const mockVendors: Vendor[] = [
  { id: 'v-1', name: 'ConstruMix' },
  { id: 'v-2', name: 'Olaria Silva' },
  { id: 'v-3', name: 'AçoForte' },
]

const mockMaterials: Material[] = [
  {
    id: 'm-1',
    name: 'Cimento CP II 50kg',
    category: 'Estrutura',
    price: 32.9,
    unit: 'saco',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=cement%20bag',
    supplier: 'ConstruMix',
    stock: 500,
    description: 'Cimento Portland composto, ideal para concreto e argamassa.',
    supplierWebsite: 'https://construmix.com.br',
    purchasePermissions: ['Project Manager', 'Admin', 'Manager'],
  },
  {
    id: 'm-2',
    name: 'Tijolo Cerâmico 14x19x29',
    category: 'Alvenaria',
    price: 1.85,
    unit: 'un',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=brick',
    supplier: 'Olaria Silva',
    stock: 10000,
    description: 'Bloco cerâmico de vedação.',
  },
  {
    id: 'm-3',
    name: 'Areia Média (m³)',
    category: 'Estrutura',
    price: 120.0,
    unit: 'm³',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=sand%20pile',
    supplier: 'Areial Porto',
    stock: 50,
    description: 'Areia lavada média para concreto.',
  },
  {
    id: 'm-4',
    name: 'Vergalhão CA-50 10mm',
    category: 'Estrutura',
    price: 45.0,
    unit: 'barra',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=steel%20rebar',
    supplier: 'AçoForte',
    stock: 300,
    description: 'Barra de aço nervurada 12m.',
  },
  {
    id: 'm-5',
    name: 'Tinta Acrílica Branca 18L',
    category: 'Acabamento',
    price: 380.0,
    unit: 'lata',
    imageUrl: 'https://img.usecurling.com/p/300/300?q=paint%20bucket',
    supplier: 'Tintas Color',
    stock: 100,
    description: 'Tinta premium fosca lavável.',
  },
]

export const useMaterialStore = create<MaterialState>((set, get) => ({
  materials: mockMaterials,
  orders: [
    {
      id: 'mock-order-1',
      projectId: 'proj-1',
      vendorName: 'ConstruMix',
      total: 1645.0,
      status: 'pending_manager',
      date: new Date(Date.now() - 86400000),
      requesterName: 'Ana Gerente',
      items: [
        {
          material: mockMaterials[0],
          quantity: 50,
          unitPrice: 32.9,
          total: 1645.0,
          brand: 'Votorantim',
        },
      ],
    },
  ],
  vendors: mockVendors,
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date(),
        },
      ],
    })),
  getMaterials: () => get().materials,
  getOrdersByProject: (projectId) =>
    get().orders.filter((o) => o.projectId === projectId),
  updateMaterial: (id, data) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, ...data } : m,
      ),
    })),
  updateOrderStatus: (id, status, actorName) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id === id) {
          const updates: Partial<Order> = { status }
          if (status === 'pending_finance') {
            updates.managerName = actorName
            updates.managerApprovedAt = new Date()
          } else if (status === 'ordered') {
            updates.financeName = actorName
            updates.financeApprovedAt = new Date()
          } else if (status === 'rejected') {
            updates.rejectedBy = actorName
            updates.rejectedAt = new Date()
          }
          return { ...o, ...updates }
        }
        return o
      }),
    })),
  updateOrderReceipt: (id, receiptUrl) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, receiptUrl } : o)),
    })),
  importMaterialList: async (file) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { success: true, count: 5 }
  },
  addVendor: (vendor) => {
    const newVendor = { ...vendor, id: Math.random().toString(36).substr(2, 9) }
    set((state) => ({ vendors: [...state.vendors, newVendor] }))
    return newVendor
  },
}))
