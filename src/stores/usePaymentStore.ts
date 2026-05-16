import { create } from 'zustand'

export interface Transaction {
  id: string
  jobId?: string
  jobTitle: string
  payerId: string
  payerName: string
  receiverId: string
  receiverName: string
  amount: number
  status:
    | 'pending'
    | 'completed'
    | 'failed'
    | 'escrow'
    | 'scheduled'
    | 'refund_requested'
    | 'refunded'
  date: Date
  scheduledDate?: Date
  type: 'payment' | 'receipt'
  category?: 'labor' | 'material' | 'equipment' | 'other'
}

interface PaymentState {
  transactions: Transaction[]
  processPayment: (
    jobId: string,
    jobTitle: string,
    amount: number,
    payer: { id: string; name: string },
    receiver: { id: string; name: string },
  ) => Promise<boolean>
  schedulePayment: (
    transaction: Omit<Transaction, 'id' | 'status' | 'date' | 'type'>,
    date: Date,
  ) => void
  getTransactionsByUser: (userId: string) => Transaction[]
  getScheduledPayments: (userId: string) => Transaction[]
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  transactions: [
    {
      id: 'tx-seed-1',
      jobId: 'job-seed-1',
      jobTitle: 'Desenvolvimento Web Site',
      payerId: 'owner-1',
      payerName: 'Cliente Seed',
      receiverId: 'executor-1',
      receiverName: 'Dev Seed',
      amount: 1500,
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 5),
      type: 'payment',
      category: 'labor',
    },
    {
      id: 'tx-seed-2',
      jobTitle: 'Compra de Cimento',
      payerId: 'owner-1',
      payerName: 'Cliente Seed',
      receiverId: 'supp-1',
      receiverName: 'ConstruMix',
      amount: 3500,
      status: 'scheduled',
      date: new Date(),
      scheduledDate: new Date(Date.now() + 86400000 * 10),
      type: 'payment',
      category: 'material',
    },
  ],
  processPayment: async (jobId, jobTitle, amount, payer, receiver) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      jobTitle,
      payerId: payer.id,
      payerName: payer.name,
      receiverId: receiver.id,
      receiverName: receiver.name,
      amount,
      status: 'escrow',
      date: new Date(),
      type: 'payment',
      category: 'labor',
    }

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }))

    return true
  },
  schedulePayment: (transaction, date) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          ...transaction,
          id: Math.random().toString(36).substr(2, 9),
          status: 'scheduled',
          date: new Date(),
          scheduledDate: date,
          type: 'payment',
        },
      ],
    })),
  getTransactionsByUser: (userId) => {
    const { transactions } = get()
    return transactions.filter(
      (t) => t.payerId === userId || t.receiverId === userId,
    )
  },
  getScheduledPayments: (userId) => {
    const { transactions } = get()
    return transactions.filter(
      (t) => t.payerId === userId && t.status === 'scheduled',
    )
  },
}))
