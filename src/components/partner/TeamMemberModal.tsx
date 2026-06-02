import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'

interface TeamMemberModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  partnerId: string
}

export function TeamMemberModal({
  open,
  onClose,
  projectId,
  partnerId,
}: TeamMemberModalProps) {
  const { addPartnerTeamMember, getProject } = useProjectStore()
  const { user } = useAuthStore() // Get logged in user to access global team
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [role, setRole] = useState('')

  const project = getProject(projectId)
  // Assuming the logged-in user is the Partner, so we use their teamMembers
  const availableMembers = user?.teamMembers || []

  const handleSave = () => {
    if (!selectedMemberId || !role) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Erro',
        description:
          t('val.required') || 'Preencha todos os campos obrigatórios.',
      })
      return
    }

    const member = availableMembers.find((m) => m.id === selectedMemberId)
    if (!member) return

    // Duplicate Check in project
    const partner = project?.partners.find((p) => p.id === partnerId)
    if (partner) {
      const exists = partner.team.some((m) => m.registrationId === member.id) // check against original ID
      if (exists) {
        toast({
          variant: 'destructive',
          title: t('error') || 'Erro',
          description:
            t('team.error.duplicate') ||
            'Este membro já está alocado neste projeto.',
        })
        return
      }
    }

    addPartnerTeamMember(projectId, partnerId, {
      name: member.name,
      email: member.email,
      phone: '(00) 0000-0000', // Mock or add phone to TeamMember interface if needed, but for now placeholder
      role: role as any,
      registrationId: member.id,
    })

    toast({
      title: t('success') || 'Sucesso',
      description: t('team.added') || 'Membro adicionado à equipe com sucesso.',
    })
    setSelectedMemberId('')
    setRole('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('team.modal.title') || 'Adicionar Membro à Equipe'}
          </DialogTitle>
          <DialogDescription>
            {t('team.modal.desc') || 'Selecione um profissional da sua equipe.'}
          </DialogDescription>
        </DialogHeader>

        {availableMembers.length === 0 ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('team.modal.empty') ||
                'Você não possui membros cadastrados na equipe.'}
            </p>
            <Button asChild variant="outline">
              <Link to="/team">
                {t('team.modal.manage') || 'Gerenciar Equipe'}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('team.modal.member_label') || 'Profissional'}</Label>
              <Select
                onValueChange={setSelectedMemberId}
                value={selectedMemberId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t('team.modal.member_placeholder') ||
                      'Selecione o profissional...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((m) => {
                    const roleMap: Record<string, string> = {
                      Engineer: 'Engenheiro',
                      Electrician: 'Eletricista',
                      Tiler: 'Azulejista',
                      Roofer: 'Telhadista',
                      Other: 'Outro',
                    }
                    const translatedRole =
                      t(`role.${m.role.toLowerCase().replace(' ', '_')}`) ||
                      roleMap[m.role] ||
                      m.role

                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({translatedRole})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('team.modal.role_label') || 'Função no Projeto'}</Label>
              <Select onValueChange={setRole} value={role}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t('team.modal.role_placeholder') ||
                      'Selecione a função...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineer">
                    {t('role.engineer') || 'Engenheiro'}
                  </SelectItem>
                  <SelectItem value="Electrician">
                    {t('role.electrician') || 'Eletricista'}
                  </SelectItem>
                  <SelectItem value="Tiler">
                    {t('role.tiler') || 'Azulejista'}
                  </SelectItem>
                  <SelectItem value="Roofer">
                    {t('role.roofer') || 'Telhadista'}
                  </SelectItem>
                  <SelectItem value="Other">
                    {t('role.other') || 'Outro'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSave} disabled={availableMembers.length === 0}>
            {t('confirm') || 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
