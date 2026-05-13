import { create } from 'zustand'

export interface Measurement {
  id: string
  stageId: string
  subStageId: string
  requestedPercentage: number
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  date: Date
  partnerId?: string
}

export interface Inspection {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected'
  date?: Date
  notes?: string
  evidenceUrls: string[]
}

export interface DailyLog {
  id: string
  date: Date
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snow'
  teamSize: number
  equipment: string
  occurrences: string
  photos: string[]
  stamp?: {
    date: string
    coords: string
  }
}

export interface CostItem {
  id: string
  description: string
  amount: number
  type: 'estimated' | 'actual'
  category: 'material' | 'labor' | 'equipment' | 'logistics' | 'other'
  costClass?: 'capex' | 'soft_cost'
  date: Date
  sourceId?: string
  stageId?: string
  budgetItemId?: string
}

export interface CheckingAccount {
  id: string
  name: string
  bankName: string
  agency: string
  accountNumber: string
  initialBalance: number
}

export interface FinancialMovement {
  id: string
  accountId: string
  description: string
  amount: number
  type: 'in' | 'out'
  date: Date
  category?: string
  stageId?: string
  budgetItemId?: string
}

export interface BimFile {
  id: string
  name: string
  url: string
  type: string
  uploadedAt: Date
  size: string
}

export interface PartnerContact {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

export interface PartnerTeamMember {
  id: string
  name: string
  role: 'Engineer' | 'Electrician' | 'Tiler' | 'Roofer' | 'Other'
  email: string
  phone: string
  registrationId: string
}

export interface ProjectPartner {
  id: string
  companyName: string
  email: string
  phone: string
  specialty: string
  stageId: string
  agreedPrice: number
  contractUrl?: string
  licensesUrl?: string
  insuranceUrl?: string
  contacts: PartnerContact[]
  team: PartnerTeamMember[]
  performanceScore: number
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  employees: {
    id: string
    name: string
    role: string
  }[]
}

export interface SubStage {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  startDate: Date
  endDate: Date
  progress: number
  assignedTeamMemberId?: string
  taskPrice?: number
  invoiceStatus?: 'pending' | 'sent_to_partner' | 'sent_to_contractor' | 'paid'
  partnerRating?: number
}

export interface Stage {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  startDate: Date
  endDate: Date
  actualStartDate?: Date
  actualEndDate?: Date
  budgetMaterial: number
  budgetLabor: number
  actualMaterial: number
  actualLabor: number
  description: string
  bimFiles: BimFile[]
  progress: number
  subStages: SubStage[]
}

export interface ProjectAddress {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  country?: 'BR' | 'US'
}

export interface BudgetItem {
  id: string
  description: string
  category: 'material' | 'labor' | 'other'
  costClass?: 'capex' | 'soft_cost'
  unitCost: number
  quantity: number
  totalCost: number
}

export interface ApprovalLog {
  id: string
  type: 'invoice' | 'document' | 'activity' | 'measurement'
  referenceId: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'in_review'
  date: Date
  history: {
    date: Date
    status: string
    user: string
  }[]
}

export interface Integration {
  platform: 'trello' | 'asana' | 'jira'
  connected: boolean
  lastSync?: Date
}

export interface ConstructionItem {
  id: string
  name: string
  stage: 'M1' | 'M2' | 'M3' | 'M4' | string
  startDate: Date
  endDate: Date
  pricePerSqFt?: number
  totalPrice: number
  isCustom?: boolean
}

export interface LaborAdjustment {
  id: string
  description: string
  amount: number
  date: Date
}

export interface QuoteItem {
  id: string
  description: string
  amount: number
}

export interface Quote {
  id: string
  partnerId: string
  stageId: string
  totalAmount: number
  items: QuoteItem[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  contractUrl?: string
}

export interface ProjectInvoice {
  id: string
  quoteId?: string
  partnerId: string
  contractorName: string
  partnerName: string
  description: string
  totalAmount: number
  date: Date
  status: 'generated' | 'paid'
}

export interface ProjectMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: Date
  type: 'internal' | 'external'
}

export interface ComplianceDocumentHistory {
  id: string
  url?: string
  expirationDate: Date
  issueDate?: Date
  uploadedAt: Date
}

export interface ComplianceDocument {
  id: string
  name: string
  description?: string
  type:
    | 'permit'
    | 'city_hall'
    | 'contractor_contract'
    | 'constructor_insurance'
    | 'owner_insurance'
    | 'technical'
    | 'other'
  provider?: string
  partnerId?: string // 'general' or specific partner ID
  expirationDate: Date
  issueDate?: Date
  url?: string
  isCritical: boolean
  history?: ComplianceDocumentHistory[]
}

export interface ProjectLedgerEntry {
  id: string
  description: string
  origin: string
  partnerId: string
  purchaseDate?: Date
  deliveryDate?: Date
  startDate?: Date
  endDate?: Date
  estimatedCost: number
  finalCost: number
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue'
  executionStatus: 'pending' | 'approved' | 'rejected' | 'in_review'
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description: string
  location: string
  region: 'BR' | 'US'
  address: ProjectAddress
  startDate: Date
  endDate: Date
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  stages: Stage[]
  partners: ProjectPartner[]
  totalBudget: number
  purchaseApprovalThreshold?: number
  totalSpent: number
  budgetItems: BudgetItem[]
  approvalLogs: ApprovalLog[]
  integrations: Integration[]
  allocatedCosts?: CostItem[]
  checkingAccounts?: CheckingAccount[]
  preferredVendorId?: string
  financialMovements?: FinancialMovement[]
  sqFt?: number
  constructionItems: ConstructionItem[]
  laborAdjustments?: LaborAdjustment[]
  inspections: Inspection[]
  dailyLogs: DailyLog[]
  quotes: Quote[]
  invoices: ProjectInvoice[]
  messages: ProjectMessage[]
  measurements?: Measurement[]
  complianceDocuments?: ComplianceDocument[]
  alertLeadTimeDays?: number
  ledgerEntries?: ProjectLedgerEntry[]
}

interface ProjectState {
  projects: Project[]
  addProject: (
    project: Omit<
      Project,
      | 'id'
      | 'totalSpent'
      | 'partners'
      | 'budgetItems'
      | 'approvalLogs'
      | 'integrations'
      | 'allocatedCosts'
      | 'checkingAccounts'
      | 'financialMovements'
      | 'constructionItems'
      | 'laborAdjustments'
      | 'quotes'
      | 'invoices'
      | 'messages'
      | 'measurements'
      | 'complianceDocuments'
      | 'alertLeadTimeDays'
      | 'ledgerEntries'
    >,
  ) => void
  updateProject: (id: string, data: Partial<Project>) => void
  addStage: (
    projectId: string,
    stage: Omit<
      Stage,
      | 'id'
      | 'actualMaterial'
      | 'actualLabor'
      | 'bimFiles'
      | 'progress'
      | 'subStages'
    >,
  ) => void
  updateStage: (
    projectId: string,
    stageId: string,
    data: Partial<Stage>,
  ) => void
  deleteStage: (projectId: string, stageId: string) => void
  addSubStage: (
    projectId: string,
    stageId: string,
    subStage: Omit<SubStage, 'id'>,
  ) => void
  updateSubStage: (
    projectId: string,
    stageId: string,
    subStageId: string,
    data: Partial<SubStage>,
  ) => void
  deleteSubStage: (
    projectId: string,
    stageId: string,
    subStageId: string,
  ) => void
  updateStageActuals: (
    projectId: string,
    stageId: string,
    type: 'material' | 'labor',
    amount: number,
  ) => void
  importExternalBudget: (
    projectId: string,
    budgetData: { stageName: string; material: number; labor: number }[],
  ) => void
  importTimeline: (
    projectId: string,
    timelineData: {
      level: number
      name: string
      startDate: Date
      endDate: Date
      progress: number
    }[],
  ) => void
  addBimFile: (projectId: string, stageId: string, file: BimFile) => void
  addPartner: (
    projectId: string,
    partner: Omit<
      ProjectPartner,
      | 'id'
      | 'email'
      | 'phone'
      | 'specialty'
      | 'contacts'
      | 'team'
      | 'performanceScore'
    > &
      Partial<Pick<ProjectPartner, 'email' | 'phone' | 'specialty'>>,
  ) => void
  updatePartner: (
    projectId: string,
    partnerId: string,
    data: Partial<ProjectPartner>,
  ) => void
  addPartnerContact: (
    projectId: string,
    partnerId: string,
    contact: Omit<PartnerContact, 'id'>,
  ) => void
  addPartnerTeamMember: (
    projectId: string,
    partnerId: string,
    member: Omit<PartnerTeamMember, 'id'>,
  ) => void
  removePartnerTeamMember: (
    projectId: string,
    partnerId: string,
    memberId: string,
  ) => void
  reallocateTasks: (
    projectId: string,
    oldMemberId: string,
    newMemberId: string,
  ) => void
  getProject: (id: string) => Project | undefined
  generateInvoice: (
    projectId: string,
    stageId: string,
    subStageId: string,
    type: 'team_to_partner' | 'partner_to_contractor',
  ) => void
  rateTeamMember: (
    projectId: string,
    stageId: string,
    subStageId: string,
    rating: number,
  ) => void
  addBudgetItem: (projectId: string, item: Omit<BudgetItem, 'id'>) => void
  removeBudgetItem: (projectId: string, itemId: string) => void
  updateApprovalStatus: (
    projectId: string,
    approvalId: string,
    status: ApprovalLog['status'],
    user: string,
  ) => void
  toggleIntegration: (
    projectId: string,
    platform: Integration['platform'],
  ) => void

  addCheckingAccount: (
    projectId: string,
    account: Omit<CheckingAccount, 'id'>,
  ) => void

  // Financial Movements
  addFinancialMovement: (
    projectId: string,
    movement: Omit<FinancialMovement, 'id'>,
  ) => void
  updateFinancialMovement: (
    projectId: string,
    id: string,
    data: Partial<FinancialMovement>,
  ) => void
  deleteFinancialMovement: (projectId: string, id: string) => void

  // Allocated Costs
  addAllocatedCost: (projectId: string, cost: Omit<CostItem, 'id'>) => void
  updateAllocatedCost: (
    projectId: string,
    id: string,
    data: Partial<CostItem>,
  ) => void
  deleteAllocatedCost: (projectId: string, id: string) => void

  setProjectSqFt: (projectId: string, sqFt: number) => void
  applyTemplate: (projectId: string, items: ConstructionItem[]) => void
  addConstructionItem: (
    projectId: string,
    item: Omit<ConstructionItem, 'id'>,
  ) => void
  updateConstructionItem: (
    projectId: string,
    itemId: string,
    data: Partial<ConstructionItem>,
  ) => void
  removeConstructionItem: (projectId: string, itemId: string) => void
  addLaborAdjustment: (
    projectId: string,
    adjustment: Omit<LaborAdjustment, 'id'>,
  ) => void
  updateInspection: (
    projectId: string,
    inspectionId: string,
    data: Partial<Inspection>,
  ) => void
  addDailyLog: (projectId: string, log: Omit<DailyLog, 'id'>) => void
  addQuote: (
    projectId: string,
    quote: Omit<Quote, 'id' | 'createdAt' | 'status'>,
  ) => void
  updateQuoteStatus: (
    projectId: string,
    quoteId: string,
    status: Quote['status'],
  ) => void
  updateQuoteContract: (projectId: string, quoteId: string, url: string) => void
  generateInvoiceFromQuote: (projectId: string, quoteId: string) => void
  addProjectMessage: (
    projectId: string,
    message: Omit<ProjectMessage, 'id' | 'timestamp'>,
  ) => void
  requestMeasurement: (
    projectId: string,
    data: Omit<Measurement, 'id' | 'status' | 'date'>,
  ) => void
  approveMeasurement: (projectId: string, measurementId: string) => void
  updateMeasurementStatus: (
    projectId: string,
    measurementId: string,
    status: Measurement['status'],
  ) => void
  addComplianceDocument: (
    projectId: string,
    doc: Omit<ComplianceDocument, 'id' | 'history'>,
  ) => void
  updateComplianceDocument: (
    projectId: string,
    docId: string,
    data: Partial<ComplianceDocument>,
  ) => void
  renewComplianceDocument: (
    projectId: string,
    docId: string,
    data: Partial<ComplianceDocument>,
  ) => void
  deleteComplianceDocument: (projectId: string, docId: string) => void
  updateAlertLeadTime: (projectId: string, days: number) => void
  updateProjectPreferredVendor: (projectId: string, vendorId?: string) => void

  // Ledger Entries
  addLedgerEntry: (
    projectId: string,
    entry: Omit<ProjectLedgerEntry, 'id'>,
  ) => void
  updateLedgerEntry: (
    projectId: string,
    id: string,
    data: Partial<ProjectLedgerEntry>,
  ) => void
  deleteLedgerEntry: (projectId: string, id: string) => void
  approveLedgerEntry: (projectId: string, id: string) => void
}

export const DEFAULT_STAGES_TEMPLATE = [
  {
    name: '1. Pré-viabilidade e Aquisição',
    description: 'Due diligence, Zoneamento.',
  },
  {
    name: '2. Planejamento Pré-construção',
    description: 'Escopo, Orçamento, Estudos preliminares.',
  },
  {
    name: '3. Projetos e Compatibilização',
    description: 'Arquitetura, MEP, Estrutural.',
  },
  {
    name: '4. Licenças e Aprovações',
    description: 'Aprovações em órgãos públicos.',
  },
  {
    name: '5. Mobilização',
    description: 'Instalação do canteiro, Planos de segurança (OSHA/PCMAT).',
  },
  {
    name: '6. Execução Física',
    description: 'Fundações, Estrutura, Instalações, Acabamentos.',
  },
  {
    name: '7. Inspeções e Certificações',
    description: 'Vistorias oficiais.',
  },
  {
    name: '8. Entrega e Pós-obra',
    description: 'Desmobilização, Habite-se/CO, Handover.',
  },
]

export const ESTIMATION_TEMPLATES = {
  'single-family': [
    { name: 'est.item.excavation', stage: 'M1' },
    { name: 'est.item.foundation_pouring', stage: 'M1' },
    { name: 'est.item.concrete_slab', stage: 'M1' },
    { name: 'est.item.framing', stage: 'M2' },
    { name: 'est.item.roofing', stage: 'M2' },
    { name: 'est.item.windows', stage: 'M2' },
    { name: 'est.item.plumbing_rough', stage: 'M3' },
    { name: 'est.item.electrical_wiring', stage: 'M3' },
    { name: 'est.item.hvac_duct', stage: 'M3' },
    { name: 'est.item.insulation', stage: 'M4' },
    { name: 'est.item.drywall', stage: 'M4' },
    { name: 'est.item.flooring', stage: 'M4' },
    { name: 'est.item.painting', stage: 'M4' },
  ],
  renovation: [
    { name: 'est.item.demolition', stage: 'M1' },
    { name: 'est.item.debris_removal', stage: 'M1' },
    { name: 'est.item.site_prep', stage: 'M1' },
    { name: 'est.item.structural_repairs', stage: 'M2' },
    { name: 'est.item.wall_mod', stage: 'M2' },
    { name: 'est.item.hvac_update', stage: 'M3' },
    { name: 'est.item.panel_upgrade', stage: 'M3' },
    { name: 'est.item.plumbing_fix', stage: 'M3' },
    { name: 'est.item.new_flooring', stage: 'M4' },
    { name: 'est.item.painting', stage: 'M4' },
    { name: 'est.item.cabinets', stage: 'M4' },
  ],
}

const recalculateTotalSpent = (p: Partial<Project>) => {
  const stagesSpent = (p.stages || []).reduce(
    (acc, s) => acc + s.actualMaterial + s.actualLabor,
    0,
  )
  const allocatedSpent = (p.allocatedCosts || []).reduce(
    (acc, c) => acc + c.amount,
    0,
  )
  const laborAdjs = (p.laborAdjustments || []).reduce(
    (acc, c) => acc + c.amount,
    0,
  )
  return stagesSpent + allocatedSpent + laborAdjs
}

const mockProjects: Project[] = []

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: mockProjects,
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...(state.projects || []),
        {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          totalSpent: 0,
          partners: [],
          budgetItems: [],
          approvalLogs: [],
          integrations: [],
          allocatedCosts: [],
          checkingAccounts: [],
          financialMovements: [],
          constructionItems: [],
          laborAdjustments: [],
          quotes: [],
          invoices: [],
          messages: [],
          measurements: [],
          complianceDocuments: [],
          alertLeadTimeDays: 30,
          ledgerEntries: [],
          preferredVendorId: undefined,
        },
      ],
    })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  addStage: (projectId, stage) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: [
              ...(p.stages || []),
              {
                ...stage,
                id: Math.random().toString(36).substr(2, 9),
                actualMaterial: 0,
                actualLabor: 0,
                bimFiles: [],
                progress: 0,
                subStages: [],
              },
            ],
          }
        }
        return p
      }),
    })),
  updateStage: (projectId, stageId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) =>
              s.id === stageId ? { ...s, ...data } : s,
            ),
          }
        }
        return p
      }),
    })),
  deleteStage: (projectId, stageId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).filter((s) => s.id !== stageId),
          }
        }
        return p
      }),
    })),
  addSubStage: (projectId, stageId, subStage) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: [
                    ...(s.subStages || []),
                    {
                      ...subStage,
                      id: Math.random().toString(36).substr(2, 9),
                    },
                  ],
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  updateSubStage: (projectId, stageId, subStageId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).map((sub) =>
                    sub.id === subStageId ? { ...sub, ...data } : sub,
                  ),
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  deleteSubStage: (projectId, stageId, subStageId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).filter(
                    (sub) => sub.id !== subStageId,
                  ),
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  updateStageActuals: (projectId, stageId, type, amount) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newStages = (p.stages || []).map((s) => {
            if (s.id === stageId) {
              return {
                ...s,
                actualMaterial:
                  type === 'material'
                    ? Math.max(0, s.actualMaterial + amount)
                    : s.actualMaterial,
                actualLabor:
                  type === 'labor'
                    ? Math.max(0, s.actualLabor + amount)
                    : s.actualLabor,
              }
            }
            return s
          })
          const updated = { ...p, stages: newStages }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  importExternalBudget: (projectId, budgetData) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newStages = (p.stages || []).map((s) => {
            const external = budgetData.find(
              (b) =>
                b.stageName.includes(s.name) || s.name.includes(b.stageName),
            )
            if (external) {
              return {
                ...s,
                budgetMaterial: external.material,
                budgetLabor: external.labor,
              }
            }
            return s
          })
          const totalBudget = newStages.reduce(
            (acc, s) => acc + s.budgetMaterial + s.budgetLabor,
            0,
          )
          return { ...p, stages: newStages, totalBudget }
        }
        return p
      }),
    })),
  importTimeline: (projectId, timelineData) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return p
        }
        return p
      }),
    })),
  addBimFile: (projectId, stageId, file) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) =>
              s.id === stageId
                ? { ...s, bimFiles: [...(s.bimFiles || []), file] }
                : s,
            ),
          }
        }
        return p
      }),
    })),
  addPartner: (projectId, partner) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: [
              ...(p.partners || []),
              {
                ...partner,
                id: Math.random().toString(36).substr(2, 9),
                email: partner.email || '',
                phone: partner.phone || '',
                specialty: partner.specialty || '',
                contacts: [],
                team: [],
                employees: [],
                performanceScore: 0,
              },
            ],
          }
        }
        return p
      }),
    })),
  updatePartner: (projectId, partnerId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) =>
              part.id === partnerId ? { ...part, ...data } : part,
            ),
          }
        }
        return p
      }),
    })),
  addPartnerContact: (projectId, partnerId, contact) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) => {
              if (part.id === partnerId) {
                if (part.contacts.length >= 3) return part
                return {
                  ...part,
                  contacts: [
                    ...(part.contacts || []),
                    { ...contact, id: Math.random().toString(36).substr(2, 9) },
                  ],
                }
              }
              return part
            }),
          }
        }
        return p
      }),
    })),
  addPartnerTeamMember: (projectId, partnerId, member) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) => {
              if (part.id === partnerId) {
                return {
                  ...part,
                  team: [
                    ...(part.team || []),
                    { ...member, id: Math.random().toString(36).substr(2, 9) },
                  ],
                }
              }
              return part
            }),
          }
        }
        return p
      }),
    })),
  removePartnerTeamMember: (projectId, partnerId, memberId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            partners: (p.partners || []).map((part) => {
              if (part.id === partnerId) {
                return {
                  ...part,
                  team: (part.team || []).filter((m) => m.id !== memberId),
                }
              }
              return part
            }),
          }
        }
        return p
      }),
    })),
  reallocateTasks: (projectId, oldMemberId, newMemberId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: p.stages.map((stage) => ({
              ...stage,
              subStages: stage.subStages.map((sub) => {
                if (sub.assignedTeamMemberId === oldMemberId) {
                  return {
                    ...sub,
                    assignedTeamMemberId: newMemberId,
                  }
                }
                return sub
              }),
            })),
          }
        }
        return p
      }),
    })),
  getProject: (id) => get().projects.find((p) => p.id === id),
  generateInvoice: (projectId, stageId, subStageId, type) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId || stageId === 'any') {
                return {
                  ...s,
                  subStages: (s.subStages || []).map((sub) => {
                    if (sub.id === subStageId) {
                      return {
                        ...sub,
                        invoiceStatus:
                          type === 'team_to_partner'
                            ? 'sent_to_partner'
                            : 'sent_to_contractor',
                      }
                    }
                    return sub
                  }),
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  rateTeamMember: (projectId, stageId, subStageId, rating) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            stages: (p.stages || []).map((s) => {
              if (s.id === stageId) {
                return {
                  ...s,
                  subStages: (s.subStages || []).map((sub) => {
                    if (sub.id === subStageId) {
                      return {
                        ...sub,
                        partnerRating: rating,
                      }
                    }
                    return sub
                  }),
                }
              }
              return s
            }),
          }
        }
        return p
      }),
    })),
  addBudgetItem: (projectId, item) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            budgetItems: [
              ...(p.budgetItems || []),
              { ...item, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  removeBudgetItem: (projectId, itemId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            budgetItems: (p.budgetItems || []).filter((i) => i.id !== itemId),
          }
        }
        return p
      }),
    })),
  updateApprovalStatus: (projectId, approvalId, status, user) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            approvalLogs: (p.approvalLogs || []).map((log) => {
              if (log.id === approvalId) {
                return {
                  ...log,
                  status,
                  history: [
                    ...log.history,
                    {
                      date: new Date(),
                      status,
                      user,
                    },
                  ],
                }
              }
              return log
            }),
          }
        }
        return p
      }),
    })),
  toggleIntegration: (projectId, platform) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const exists = p.integrations?.find((i) => i.platform === platform)
          if (exists) {
            return {
              ...p,
              integrations: p.integrations.map((i) =>
                i.platform === platform
                  ? {
                      ...i,
                      connected: !i.connected,
                      lastSync: !i.connected ? new Date() : i.lastSync,
                    }
                  : i,
              ),
            }
          }
          return {
            ...p,
            integrations: [
              ...(p.integrations || []),
              { platform, connected: true, lastSync: new Date() },
            ],
          }
        }
        return p
      }),
    })),
  addCheckingAccount: (projectId, account) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            checkingAccounts: [
              ...(p.checkingAccounts || []),
              { ...account, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  addFinancialMovement: (projectId, movement) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            financialMovements: [
              ...(p.financialMovements || []),
              { ...movement, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  updateFinancialMovement: (projectId, id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              financialMovements: p.financialMovements?.map((m) =>
                m.id === id ? { ...m, ...data } : m,
              ),
            }
          : p,
      ),
    })),
  deleteFinancialMovement: (projectId, id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              financialMovements: p.financialMovements?.filter(
                (m) => m.id !== id,
              ),
            }
          : p,
      ),
    })),
  addAllocatedCost: (projectId, cost) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newAllocatedCosts = [
            ...(p.allocatedCosts || []),
            { ...cost, id: Math.random().toString(36).substr(2, 9) },
          ]
          const updated = { ...p, allocatedCosts: newAllocatedCosts }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  updateAllocatedCost: (projectId, id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newCosts = p.allocatedCosts?.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          )
          const updated = { ...p, allocatedCosts: newCosts }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  deleteAllocatedCost: (projectId, id) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newCosts = p.allocatedCosts?.filter((c) => c.id !== id)
          const updated = { ...p, allocatedCosts: newCosts }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  setProjectSqFt: (projectId, sqFt) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, sqFt } : p,
      ),
    })),
  applyTemplate: (projectId, items) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, constructionItems: items } : p,
      ),
    })),
  addConstructionItem: (projectId, item) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              constructionItems: [
                ...(p.constructionItems || []),
                { ...item, id: Math.random().toString(36).substr(2, 9) },
              ],
            }
          : p,
      ),
    })),
  updateConstructionItem: (projectId, itemId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newItems = (p.constructionItems || []).map((item) =>
            item.id === itemId ? { ...item, ...data } : item,
          )
          return { ...p, constructionItems: newItems }
        }
        return p
      }),
    })),
  removeConstructionItem: (projectId, itemId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              constructionItems: (p.constructionItems || []).filter(
                (i) => i.id !== itemId,
              ),
            }
          : p,
      ),
    })),
  addLaborAdjustment: (projectId, adjustment) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            laborAdjustments: [
              ...(p.laborAdjustments || []),
              { ...adjustment, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  updateInspection: (projectId, inspectionId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            inspections: p.inspections.map((i) =>
              i.id === inspectionId ? { ...i, ...data } : i,
            ),
          }
        }
        return p
      }),
    })),
  addDailyLog: (projectId, log) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            dailyLogs: [
              ...p.dailyLogs,
              { ...log, id: Math.random().toString(36).substr(2, 9) },
            ],
          }
        }
        return p
      }),
    })),
  addQuote: (projectId, quote) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              quotes: [
                ...(p.quotes || []),
                {
                  ...quote,
                  id: Math.random().toString(36).substr(2, 9),
                  createdAt: new Date(),
                  status: 'pending',
                },
              ],
            }
          : p,
      ),
    })),
  updateQuoteStatus: (projectId, quoteId, status) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const existingQuote = p.quotes?.find((q) => q.id === quoteId)
          if (!existingQuote || existingQuote.status === status) return p // Race condition prevention

          const quotes = (p.quotes || []).map((q) =>
            q.id === quoteId ? { ...q, status } : q,
          )

          let invoices = p.invoices || []
          let allocatedCosts = p.allocatedCosts || []

          if (status === 'approved') {
            const quote = quotes.find((q) => q.id === quoteId)
            if (quote && !invoices.some((i) => i.quoteId === quote.id)) {
              const partner = p.partners?.find(
                (pt) => pt.id === quote.partnerId,
              )

              const invoice: ProjectInvoice = {
                id: Math.random().toString(36).substr(2, 9),
                quoteId: quote.id,
                partnerId: quote.partnerId,
                contractorName: p.ownerId || 'Contractor',
                partnerName: partner?.companyName || 'Partner',
                description: `Fatura automática - Orçamento #${quote.id.substring(0, 4)}`,
                totalAmount: quote.totalAmount,
                date: new Date(),
                status: 'generated',
              }

              const costItem: CostItem = {
                id: Math.random().toString(36).substr(2, 9),
                description: `Pagamento Orçamento ${partner?.companyName || 'Parceiro'}`,
                amount: quote.totalAmount,
                type: 'actual',
                category: 'other',
                costClass: 'capex',
                date: new Date(),
                stageId: quote.stageId,
              }

              invoices = [...invoices, invoice]
              allocatedCosts = [...allocatedCosts, costItem]
            }
          }

          const updated = { ...p, quotes, invoices, allocatedCosts }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  updateQuoteContract: (projectId, quoteId, url) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              quotes: (p.quotes || []).map((q) =>
                q.id === quoteId ? { ...q, contractUrl: url } : q,
              ),
            }
          : p,
      ),
    })),
  generateInvoiceFromQuote: (projectId, quoteId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const quote = p.quotes?.find((q) => q.id === quoteId)
          if (!quote) return p
          const partner = p.partners?.find((pt) => pt.id === quote.partnerId)

          const invoice: ProjectInvoice = {
            id: Math.random().toString(36).substr(2, 9),
            quoteId: quote.id,
            partnerId: quote.partnerId,
            contractorName: p.ownerId || 'Contractor',
            partnerName: partner?.companyName || 'Partner',
            description: `Fatura referente ao Orçamento #${quote.id.substring(0, 4)}`,
            totalAmount: quote.totalAmount,
            date: new Date(),
            status: 'generated',
          }

          const costItem: CostItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: `Pagamento Fatura ${partner?.companyName || 'Parceiro'}`,
            amount: quote.totalAmount,
            type: 'actual',
            category: 'other',
            costClass: 'capex',
            date: new Date(),
            stageId: quote.stageId,
          }

          const updated = {
            ...p,
            invoices: [...(p.invoices || []), invoice],
            allocatedCosts: [...(p.allocatedCosts || []), costItem],
          }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  addProjectMessage: (projectId, message) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              messages: [
                ...(p.messages || []),
                {
                  ...message,
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date(),
                },
              ],
            }
          : p,
      ),
    })),
  requestMeasurement: (projectId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            measurements: [
              ...(p.measurements || []),
              {
                ...data,
                id: Math.random().toString(36).substr(2, 9),
                status: 'pending',
                date: new Date(),
              },
            ],
          }
        }
        return p
      }),
    })),
  approveMeasurement: (projectId, measurementId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const measurement = p.measurements?.find(
            (m) => m.id === measurementId,
          )
          if (!measurement || measurement.status === 'approved') return p // Race condition prevention

          const newMeasurements = p.measurements?.map((m) =>
            m.id === measurementId ? { ...m, status: 'approved' as const } : m,
          )

          const clampedProgress = Math.min(
            100,
            Math.max(0, measurement.requestedPercentage),
          )

          // Update substage progress
          const newStages = p.stages.map((s) => {
            if (s.id === measurement.stageId) {
              return {
                ...s,
                subStages: s.subStages.map((sub) => {
                  if (sub.id === measurement.subStageId) {
                    return {
                      ...sub,
                      progress: clampedProgress,
                      status:
                        clampedProgress === 100 ? 'completed' : sub.status,
                    }
                  }
                  return sub
                }),
              }
            }
            return s
          })

          // Add allocated cost
          const costItem: CostItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: `Medição Aprovada (${clampedProgress}%)`,
            amount: Math.max(0, measurement.amount),
            type: 'actual',
            category: 'labor',
            costClass: 'capex',
            date: new Date(),
            stageId: measurement.stageId,
          }

          // Generate Invoice
          const invoice: ProjectInvoice = {
            id: Math.random().toString(36).substr(2, 9),
            partnerId: measurement.partnerId || '',
            contractorName: p.ownerId || 'Contractor',
            partnerName:
              p.partners?.find((pt) => pt.id === measurement.partnerId)
                ?.companyName || 'Partner',
            description: `Fatura Automática - Medição (${measurement.requestedPercentage}%)`,
            totalAmount: measurement.amount,
            date: new Date(),
            status: 'generated',
          }

          const updated = {
            ...p,
            measurements: newMeasurements,
            stages: newStages,
            allocatedCosts: [...(p.allocatedCosts || []), costItem],
            invoices: [...(p.invoices || []), invoice],
          }
          updated.totalSpent = recalculateTotalSpent(updated)
          return updated
        }
        return p
      }),
    })),
  updateMeasurementStatus: (projectId, measurementId, status) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          const newMeasurements = p.measurements?.map((m) =>
            m.id === measurementId ? { ...m, status } : m,
          )
          return { ...p, measurements: newMeasurements }
        }
        return p
      }),
    })),
  addComplianceDocument: (projectId, doc) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              complianceDocuments: [
                ...(p.complianceDocuments || []),
                {
                  ...doc,
                  id: Math.random().toString(36).substr(2, 9),
                  history: [],
                },
              ],
            }
          : p,
      ),
    })),
  updateComplianceDocument: (projectId, docId, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              complianceDocuments: (p.complianceDocuments || []).map((d) =>
                d.id === docId ? { ...d, ...data } : d,
              ),
            }
          : p,
      ),
    })),
  renewComplianceDocument: (projectId, docId, data) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            complianceDocuments: (p.complianceDocuments || []).map((d) => {
              if (d.id === docId) {
                const newHistory = [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    url: d.url,
                    expirationDate: d.expirationDate,
                    issueDate: d.issueDate,
                    uploadedAt: new Date(),
                  },
                  ...(d.history || []),
                ]
                return { ...d, ...data, history: newHistory }
              }
              return d
            }),
          }
        }
        return p
      }),
    })),
  deleteComplianceDocument: (projectId, docId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              complianceDocuments: (p.complianceDocuments || []).filter(
                (d) => d.id !== docId,
              ),
            }
          : p,
      ),
    })),
  updateAlertLeadTime: (projectId, days) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, alertLeadTimeDays: days } : p,
      ),
    })),

  updateProjectPreferredVendor: (projectId, vendorId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, preferredVendorId: vendorId } : p,
      ),
    })),

  // Ledger Entries
  addLedgerEntry: (projectId, entry) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              ledgerEntries: [
                ...(p.ledgerEntries || []),
                {
                  ...entry,
                  id: Math.random().toString(36).substr(2, 9),
                },
              ],
            }
          : p,
      ),
    })),
  updateLedgerEntry: (projectId, id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              ledgerEntries: (p.ledgerEntries || []).map((l) =>
                l.id === id ? { ...l, ...data } : l,
              ),
            }
          : p,
      ),
    })),
  deleteLedgerEntry: (projectId, id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              ledgerEntries: (p.ledgerEntries || []).filter((l) => l.id !== id),
            }
          : p,
      ),
    })),
  approveLedgerEntry: (projectId, id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              ledgerEntries: (p.ledgerEntries || []).map((l) =>
                l.id === id ? { ...l, executionStatus: 'approved' } : l,
              ),
            }
          : p,
      ),
    })),
}))
