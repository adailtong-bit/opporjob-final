import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useProjectStore } from '@/stores/useProjectStore'
import { useContractorStore } from '@/stores/useContractorStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Trash2,
  UserPlus,
  HardHat,
  Briefcase,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface ProjectTeamManagerProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export function ProjectTeamManager({
  open,
  onClose,
  projectId,
}: ProjectTeamManagerProps) {
  const {
    getProject,
    addPartnerTeamMember,
    removePartnerTeamMember,
    reallocateTasks,
  } = useProjectStore()
  const { contractors } = useContractorStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const project = getProject(projectId)

  // Adding Member State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('')
  const [selectedContractorId, setSelectedContractorId] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [filterLinkedPj, setFilterLinkedPj] = useState(true)

  // Removal/Reallocation State
  const [isReallocateDialogOpen, setIsReallocateDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string
    name: string
    partnerId: string
  } | null>(null)
  const [substituteId, setSubstituteId] = useState<string>('')

  if (!project) return null

  const handleOpenAddDialog = (partnerId: string) => {
    setSelectedPartnerId(partnerId)
    setRole('')
    setSelectedContractorId('')
    setIsAddDialogOpen(true)
    setFilterLinkedPj(true)
  }

  const handleAddMember = () => {
    if (!selectedPartnerId || !selectedContractorId || !role) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('val.required'),
      })
      return
    }

    // Check for Duplicates
    const partner = project.partners.find((p) => p.id === selectedPartnerId)
    if (partner) {
      const contractor = contractors.find((c) => c.id === selectedContractorId)
      if (!contractor) return

      const exists = partner.team.some(
        (m) => m.registrationId === contractor.id,
      )
      if (exists) {
        toast({
          variant: 'destructive',
          title: t('error'),
          description: t('team.error.duplicate'),
        })
        return
      }

      addPartnerTeamMember(projectId, selectedPartnerId, {
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone,
        role: role as any,
        registrationId: contractor.id,
      })

      toast({
        title: t('success'),
        description: t('team.added'),
      })
      setIsAddDialogOpen(false)
    }
  }

  const checkPendingTasks = (memberId: string) => {
    // Check if member has assigned tasks in any stage of this project
    return project.stages.some((stage) =>
      stage.subStages.some(
        (sub) =>
          sub.assignedTeamMemberId === memberId && sub.status !== 'completed',
      ),
    )
  }

  const handleRemoveClick = (
    partnerId: string,
    memberId: string,
    memberName: string,
  ) => {
    const hasPending = checkPendingTasks(memberId)
    if (hasPending) {
      setMemberToRemove({ id: memberId, name: memberName, partnerId })
      setIsReallocateDialogOpen(true)
    } else {
      removePartnerTeamMember(projectId, partnerId, memberId)
      toast({
        title: t('success'),
        description: t('team.removed'),
      })
    }
  }

  const handleConfirmReallocation = () => {
    if (memberToRemove && substituteId) {
      // Reallocate
      reallocateTasks(projectId, memberToRemove.id, substituteId)
      // Then Remove
      removePartnerTeamMember(
        projectId,
        memberToRemove.partnerId,
        memberToRemove.id,
      )

      toast({
        title: t('success'),
        description: t('team.reallocated'),
      })
      setIsReallocateDialogOpen(false)
      setMemberToRemove(null)
      setSubstituteId('')
    }
  }

  // Filter contractors based on selection logic
  const filteredContractors = contractors.filter((c) => {
    if (filterLinkedPj && selectedPartnerId) {
      return c.linkedPjId === selectedPartnerId
    }
    return true
  })

  // Get available substitutes (team members of the same partner, excluding the one being removed)
  const availableSubstitutes = memberToRemove
    ? project.partners
        .find((p) => p.id === memberToRemove.partnerId)
        ?.team.filter((m) => m.id !== memberToRemove.id) || []
    : []

  const partnersList = project.partners || []

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" /> {t('team.manager.title')}
            </SheetTitle>
            <SheetDescription>{t('team.manager.title')}</SheetDescription>
          </SheetHeader>

          {partnersList.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/20">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('team.no_partner')}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {partnersList.map((partner) => (
                <div key={partner.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> {partner.companyName}
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenAddDialog(partner.id)}
                      className="h-8 text-xs"
                    >
                      <UserPlus className="mr-2 h-3 w-3" /> {t('team.add')}
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {partner.team.length > 0 ? (
                      partner.team.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {member.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-none truncate">
                                {member.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1 py-0 h-4 whitespace-nowrap"
                                >
                                  {t(
                                    `role.${member.role.toLowerCase().replace(' ', '_')}`,
                                  ) || member.role}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {member.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemoveClick(
                                partner.id,
                                member.id,
                                member.name,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic pl-2">
                        {t('team.no_team_partner')}
                      </div>
                    )}
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('team.add')}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-pj"
                checked={filterLinkedPj}
                onCheckedChange={(c) => setFilterLinkedPj(!!c)}
              />
              <Label
                htmlFor="filter-pj"
                className="text-sm font-normal cursor-pointer flex items-center gap-1"
              >
                <Filter className="h-3 w-3" /> {t('team.filter_linked')}
              </Label>
            </div>

            <div className="grid gap-2">
              <Label>{t('team.contractor_label')}</Label>
              <Select
                onValueChange={(val) => {
                  setSelectedContractorId(val)
                  const c = contractors.find((ct) => ct.id === val)
                  if (c && c.role) setRole(c.role)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('team.select_pro')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredContractors.length > 0 ? (
                    filteredContractors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.role}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-center text-muted-foreground">
                      {t('team.no_contractor')}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('team.role')}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('team.select_role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineer">{t('role.engineer')}</SelectItem>
                  <SelectItem value="Electrician">
                    {t('role.electrician')}
                  </SelectItem>
                  <SelectItem value="Tiler">{t('role.tiler')}</SelectItem>
                  <SelectItem value="Roofer">{t('role.roofer')}</SelectItem>
                  <SelectItem value="Other">{t('role.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddMember}>{t('confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reallocation Dialog */}
      <Dialog
        open={isReallocateDialogOpen}
        onOpenChange={setIsReallocateDialogOpen}
      >
        <DialogContent className="border-l-4 border-l-yellow-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-700">
              <RefreshCw className="h-5 w-5" /> {t('team.reallocate')}
            </DialogTitle>
            <DialogDescription>
              {t('team.reallocate.desc')} ({memberToRemove?.name})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>{t('team.substitute')}</Label>
            <Select onValueChange={setSubstituteId} value={substituteId}>
              <SelectTrigger>
                <SelectValue placeholder={t('general.select')} />
              </SelectTrigger>
              <SelectContent>
                {availableSubstitutes.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name} -{' '}
                    {t(`role.${sub.role.toLowerCase()}`) || sub.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsReallocateDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirmReallocation}
              disabled={!substituteId}
            >
              {t('confirm')} & {t('remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
