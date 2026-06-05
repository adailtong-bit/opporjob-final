import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Play, Pause, Trash2 } from 'lucide-react'
import { useAdStore, AdCampaign } from '@/stores/useAdStore'
import { useToast } from '@/hooks/use-toast'

export function AdActionsMenu({ ad }: { ad: AdCampaign }) {
  const { updateAd, deleteAd } = useAdStore()
  const { toast } = useToast()

  const handleToggleStatus = async () => {
    const newStatus = ad.status === 'active' ? 'expired' : 'active'
    await updateAd(ad.id, { status: newStatus })
    toast({ title: `Campaign ${newStatus}` })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteAd(ad.id)
      toast({ title: 'Campaign deleted' })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggleStatus}>
          {ad.status === 'active' ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Suspend
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
