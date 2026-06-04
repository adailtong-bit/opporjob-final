import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Invoice {
  id: string
  job_id?: string
  project_id?: string
  task_id?: string
  payer_id?: string
  receiver_id?: string
  amount: number
  currency: string
  status: string
  description: string
  type: string
  due_date?: string
  created_at: string
}

export function useInvoices(userId?: string, projectId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = useCallback(async () => {
    if (!userId && !projectId) {
      setLoading(false)
      return
    }
    setLoading(true)
    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    } else if (userId) {
      query = query.or(`payer_id.eq.${userId},receiver_id.eq.${userId}`)
    }

    const { data, error } = await query

    if (!error && data) {
      setInvoices(data as Invoice[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const createInvoice = async (invoice: Partial<Invoice>) => {
    const { error } = await supabase.from('invoices').insert([invoice])
    if (!error) {
      fetchInvoices()
      return true
    }
    return false
  }

  const updateInvoiceStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
    if (!error) {
      fetchInvoices()
      return true
    }
    return false
  }

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoiceStatus,
  }
}
