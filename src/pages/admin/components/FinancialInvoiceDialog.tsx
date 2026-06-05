import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Mail, Loader2 } from 'lucide-react'
import { formatCurrencyValue } from '@/lib/utils'

interface Props {
  invoice: any
  onClose: () => void
  onSuccess: () => void
}

export function FinancialInvoiceDialog({ invoice, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const vendor = invoice.vendor || {}

  const handleApprove = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        'send-invoice-email',
        {
          body: { invoiceId: invoice.id },
        },
      )

      if (error) throw error

      toast({
        title: 'Invoice Approved',
        description: 'The invoice was approved and sent to the advertiser.',
      })
      onSuccess()
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error sending invoice',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Revisar Fatura - {invoice.type}</DialogTitle>
          <DialogDescription>
            Verifique os dados da fatura antes de aprovar e enviar para o
            anunciante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted p-4 rounded-md space-y-2">
            <h4 className="font-semibold text-sm">Dados do Emissor (Admin)</h4>
            <p className="text-xs text-muted-foreground">
              OpporJob LLC
              <br />
              123 Tech Lane, NY
              <br />
              Tax ID: 00-0000000
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md space-y-2">
            <h4 className="font-semibold text-sm">
              Dados do Destinatário (Anunciante)
            </h4>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">
                {vendor.company_name || vendor.name || 'N/A'}
              </span>
              <br />
              Document / Tax ID: {vendor.tax_id || vendor.document || 'N/A'}
              <br />
              Financial Email: {vendor.financial_email || vendor.email || 'N/A'}
              <br />
              Address:{' '}
              {[vendor.street, vendor.number, vendor.city, vendor.state]
                .filter(Boolean)
                .join(', ') || 'N/A'}
            </p>
          </div>

          <div className="border p-4 rounded-md space-y-3">
            <h4 className="font-semibold text-sm">Detalhes da Fatura</h4>
            <div className="text-sm">
              <span className="text-muted-foreground block mb-1">
                Descrição:
              </span>
              <p className="whitespace-pre-wrap font-medium">
                {invoice.description}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="font-semibold">Valor Total:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrencyValue(invoice.amount, invoice.currency || 'USD')}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Aprovar e Enviar Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
