import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface PremiumConstructionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PremiumConstructionModal({
  open,
  onOpenChange,
}: PremiumConstructionModalProps) {
  const navigate = useNavigate()
  const { t } = useLanguageStore()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogHeader>
          <div className="mx-auto bg-amber-100 p-4 rounded-full mb-4 w-fit">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('premium.modal.title')}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            {t('premium.modal.desc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
          <Button
            className="w-full h-12 text-lg"
            onClick={() => {
              onOpenChange(false)
              navigate('/construction/plans')
            }}
          >
            {t('premium.modal.btn_view')}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {t('premium.modal.btn_cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
