import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, FileText, Trash, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAdStore } from '@/stores/useAdStore'
import { AdEditDialog } from './AdEditDialog'

export function AdActionsMenu({ ad }: { ad: any }) {
  const { toast } = useToast()
  const { fetchAds } = useAdStore()
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    setDeleting(true)
    const { error } = await supabase
      .from('advertising_campaigns')
      .delete()
      .eq('id', ad.id)
    if (error) {
      toast({
        title: 'Error deleting',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Deleted successfully' })
      fetchAds()
    }
    setDeleting(false)
  }

  const handleGenerateContract = () => {
    const advertiserName =
      ad.advertiser?.name ||
      ad.advertiser?.company_name ||
      'Unspecified Advertiser'
    const document = ad.advertiser?.document || ad.advertiser?.tax_id || 'N/A'
    const address =
      [ad.advertiser?.street, ad.advertiser?.city, ad.advertiser?.state]
        .filter(Boolean)
        .join(', ') || 'N/A'

    const contractHtml = `
      <html>
        <head>
          <title>Service Contract - ${ad.title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6; color: #333; }
            h1 { text-align: center; color: #1a1a1a; margin-bottom: 40px; font-size: 26px; text-transform: uppercase; letter-spacing: 1px; }
            h2 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 35px; font-size: 18px; }
            .section { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 14px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; width: 35%; color: #475569; }
            td { color: #0f172a; }
            .signatures { margin-top: 100px; display: flex; justify-content: space-between; }
            .sig-box { width: 45%; border-top: 1px solid #333; padding-top: 15px; text-align: center; font-weight: bold; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Advertising Service Agreement</h1>
          
          <div class="section">
            <h2>1. Parties Involved</h2>
            <table>
              <tr><th>Contractor (Service Provider)</th><td><strong>OpporJob LLC</strong><br/>123 Tech Lane, NY 10001<br/>Tax ID: 00-0000000</td></tr>
              <tr><th>Contracted (Advertiser)</th><td><strong>${advertiserName}</strong><br/>Document (CPF/CNPJ): ${document}<br/>Address: ${address}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>2. Campaign Specifications</h2>
            <table>
              <tr><th>Campaign Title</th><td><strong>${ad.title}</strong></td></tr>
              <tr><th>Tier Level</th><td>${ad.tier || 'Standard Tier'}</td></tr>
              <tr><th>Agreed Investment</th><td><strong>$${ad.price ? Number(ad.price).toFixed(2) : '0.00'} USD</strong></td></tr>
              <tr><th>Campaign Duration</th><td>Start: ${ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'TBD'}<br/>End: ${ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'TBD'}</td></tr>
              <tr><th>Target URL</th><td><a href="${ad.target_url || '#'}">${ad.target_url || 'N/A'}</a></td></tr>
            </table>
          </div>

          <div class="section">
            <h2>3. General Terms & Conditions</h2>
            <p>1. The Contractor agrees to provide the specified advertising space on the platform strictly according to the selected Tier and duration mentioned in Section 2.</p>
            <p>2. The Contracted agrees to pay the stipulated investment amount prior to the campaign activation to guarantee the reserved advertising spots.</p>
            <p>3. The Contractor reserves the right to suspend campaigns that violate platform guidelines, community standards, or present illegal material without right to refund.</p>
            <p>4. This document represents a binding digital agreement governed by the laws of the applicable jurisdiction.</p>
          </div>

          <div class="signatures">
            <div class="sig-box">
              OpporJob LLC<br/>
              <span style="font-size: 12px; font-weight: normal; color: #64748b;">(Digital Signature)</span>
            </div>
            <div class="sig-box">
              ${advertiserName}<br/>
              <span style="font-size: 12px; font-weight: normal; color: #64748b;">(Digital Signature)</span>
            </div>
          </div>

          <div class="footer">
            Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} by the OpporJob Automated Audit System.
          </div>
        </body>
      </html>
    `

    const printWin = window.open('', '', 'width=900,height=1000')
    if (printWin) {
      printWin.document.write(contractHtml)
      printWin.document.close()
      printWin.focus()
      setTimeout(() => {
        printWin.print()
      }, 800)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Campaign
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateContract}>
            <FileText className="mr-2 h-4 w-4" /> Generate Contract (PDF)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={deleting}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" /> Delete Campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdEditDialog ad={ad} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
