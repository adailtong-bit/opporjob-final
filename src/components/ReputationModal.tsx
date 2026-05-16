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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ReputationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetName: string
  targetId?: string
  isContractorRating: boolean // True if logged user is contractor rating executor
}

export function ReputationModal({
  open,
  onOpenChange,
  targetName,
  isContractorRating,
}: ReputationModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const { updateUserReputation, user } = useAuthStore()
  const { toast } = useToast()

  const categories = isContractorRating
    ? ['Qualidade', 'Pontualidade', 'Comunicação', 'Profissionalismo']
    : ['Clareza', 'Comunicação', 'Pagamento', 'Respeito']

  const handleSubmit = async () => {
    if (targetId && user) {
      try {
        const { error } = await supabase.from('reviews').insert({
          reviewer_id: user.id,
          target_id: targetId,
          rating,
          comment,
        })
        if (error) throw error
        toast({ title: 'Avaliação enviada com sucesso!' })
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: err.message,
        })
        return
      }
    }

    updateUserReputation(4.9) // Just updating local store for visual feedback
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar {targetName}</DialogTitle>
          <DialogDescription>
            Como foi sua experiência? Sua avaliação ajuda a comunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={cn(
                  'transition-all hover:scale-110 focus:outline-none',
                  rating >= star
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300',
                )}
              >
                <Star
                  className={cn('h-8 w-8', rating >= star && 'fill-current')}
                />
              </button>
            ))}
          </div>
          <span className="font-semibold text-lg">
            {rating > 0 ? rating + '.0' : 'Selecione'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Critérios (Opcional)</Label>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" /> {cat}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comentário</Label>
            <Textarea
              placeholder="Conte mais detalhes sobre o serviço..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Pular
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={rating === 0}>
            Enviar Avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
