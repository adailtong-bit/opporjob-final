import { useState } from 'react'
import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Truck,
  Wrench,
  AlertTriangle,
  Search,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  FileText,
  DollarSign,
} from 'lucide-react'
import { isBefore, addDays } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { CurrencyInput } from '@/components/CurrencyInput'

export default function EquipmentManager() {
  const {
    equipment,
    addEquipment,
    assignToProject,
    returnEquipment,
    performMaintenance,
  } = useEquipmentStore()
  const { projects, addAllocatedCost } = useProjectStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedEq, setSelectedEq] = useState<string | null>(null)

  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState({
    eqId: '',
    description: '',
    cost: 0,
    technician: '',
  })

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'Pesado',
    serialNumber: '',
    purchaseDate: new Date(),
    location: t('eq.central_warehouse'),
    rentalCondition: '',
    rentalValue: 0,
    annualDepreciation: 0,
    rentalStartDate: '',
    rentalEndDate: '',
  })
  const [assignData, setAssignData] = useState({ projectId: '' })

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const maintenanceAlerts = equipment.filter((eq) =>
    isBefore(eq.nextMaintenance, addDays(new Date(), 7)),
  )

  const handleAdd = () => {
    addEquipment({
      name: newItem.name,
      type: newItem.type,
      serialNumber: newItem.serialNumber,
      status: 'available',
      purchaseDate: newItem.purchaseDate,
      nextMaintenance: addDays(new Date(), 90),
      location: newItem.location,
      rentalCondition: newItem.rentalCondition,
      rentalValue: Number(newItem.rentalValue),
      annualDepreciation: Number(newItem.annualDepreciation),
      rentalStartDate: newItem.rentalStartDate
        ? new Date(newItem.rentalStartDate)
        : undefined,
      rentalEndDate: newItem.rentalEndDate
        ? new Date(newItem.rentalEndDate)
        : undefined,
    })
    setIsAddOpen(false)
    toast({ title: t('success') })
  }

  const handleAssign = () => {
    if (!selectedEq || !assignData.projectId) return
    const project = projects.find((p) => p.id === assignData.projectId)
    const eq = equipment.find((e) => e.id === selectedEq)
    if (project && eq) {
      assignToProject(selectedEq, project.id, project.name, project.location)

      if (eq.rentalValue && eq.rentalValue > 0) {
        addAllocatedCost(project.id, {
          description: `Locação: ${eq.name} (${eq.serialNumber})`,
          amount: eq.rentalValue,
          type: 'estimated',
          category: 'equipment',
          costClass: 'capex',
          date: new Date(),
        })
      }

      toast({
        title: t('success'),
        description: 'Check-out finalizado. Máquina alocada para o projeto.',
      })
      setIsAssignOpen(false)
    }
  }

  const handleCompleteMaintenance = () => {
    performMaintenance(maintenanceData.eqId, {
      date: new Date(),
      description: maintenanceData.description,
      cost: maintenanceData.cost,
      technician: maintenanceData.technician,
    })

    const eq = equipment.find((e) => e.id === maintenanceData.eqId)
    if (eq && eq.projectId && maintenanceData.cost > 0) {
      addAllocatedCost(eq.projectId, {
        description: `Manutenção: ${eq.name} (${maintenanceData.description})`,
        amount: maintenanceData.cost,
        type: 'actual',
        category: 'equipment',
        costClass: 'capex',
        date: new Date(),
      })
    }

    toast({ title: 'Manutenção concluída e custos registrados.' })
    setIsMaintenanceOpen(false)
  }

  const getTypeLabel = (type: string) => {
    const mapping: Record<string, string> = {
      Pesado: 'heavy',
      Leve: 'light',
      Veículo: 'vehicle',
      Estrutura: 'structure',
    }
    return t(`eq.${mapping[type] || 'other'}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('eq.manager.title')}
          </h1>
          <p className="text-muted-foreground">{t('eq.manager.desc')}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t('eq.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('eq.register.title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('eq.field.name')}</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('eq.field.serial')}</Label>
                  <Input
                    value={newItem.serialNumber}
                    onChange={(e) =>
                      setNewItem({ ...newItem, serialNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('eq.field.location')}</Label>
                  <Input
                    value={newItem.location}
                    onChange={(e) =>
                      setNewItem({ ...newItem, location: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('eq.field.type')}</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(val) =>
                      setNewItem({ ...newItem, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pesado">{t('eq.heavy')}</SelectItem>
                      <SelectItem value="Leve">{t('eq.light')}</SelectItem>
                      <SelectItem value="Veículo">{t('eq.vehicle')}</SelectItem>
                      <SelectItem value="Estrutura">
                        {t('eq.structure')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-2 block">
                  {t('eq.finance.title')}
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('eq.rental.condition')}</Label>
                    <Input
                      placeholder="Ex: Alugado, Próprio"
                      value={newItem.rentalCondition}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          rentalCondition: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('eq.rental.value')}</Label>
                    <Input
                      type="number"
                      value={newItem.rentalValue}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          rentalValue: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('eq.depreciation')}</Label>
                    <Input
                      type="number"
                      value={newItem.annualDepreciation}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          annualDepreciation: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('eq.upload.contract')}</Label>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />{' '}
                      {t('eq.select.file')}
                    </Button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="grid gap-2">
                    <Label>{t('eq.rental.start')}</Label>
                    <Input
                      type="date"
                      value={newItem.rentalStartDate}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          rentalStartDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('eq.rental.end')}</Label>
                    <Input
                      type="date"
                      value={newItem.rentalEndDate}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          rentalEndDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>{t('save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {maintenanceAlerts.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" /> {t('eq.maintenance.alert')}
            </CardTitle>
            <CardDescription>
              {t('eq.maintenance.desc', { count: maintenanceAlerts.length })}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('eq.search')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('eq.all_machines')}</SelectItem>
            <SelectItem value="available">
              {t('eq.status.available')}
            </SelectItem>
            <SelectItem value="in_use">{t('eq.status.in_use')}</SelectItem>
            <SelectItem value="maintenance">
              {t('eq.status.maintenance')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <Card key={eq.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline">{getTypeLabel(eq.type)}</Badge>
                <Badge
                  className={
                    eq.status === 'available'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : eq.status === 'in_use'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                  }
                >
                  {eq.status === 'available'
                    ? t('eq.status.available')
                    : eq.status === 'in_use'
                      ? t('eq.status.in_use')
                      : t('eq.status.maintenance')}
                </Badge>
              </div>
              <CardTitle className="mt-2 flex items-center gap-2">
                <Truck className="h-5 w-5" /> {eq.name}
              </CardTitle>
              <CardDescription>
                {t('eq.field.serial')}: {eq.serialNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span
                  className={
                    eq.status === 'in_use'
                      ? 'font-semibold text-blue-700'
                      : 'text-muted-foreground'
                  }
                >
                  {eq.location}
                </span>
              </div>
              {eq.status === 'in_use' && (
                <div className="text-xs bg-blue-50 p-2 rounded text-blue-800">
                  {t('eq.allocated_project')}: <strong>{eq.projectName}</strong>
                </div>
              )}
              {eq.rentalValue ? (
                <div className="text-xs flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Valor do Aluguel: {formatCurrency(eq.rentalValue)}
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
                <CalendarIcon className="h-4 w-4" />
                {t('eq.next_maint')}:{' '}
                {formatDate(eq.nextMaintenance, 'dd/MM/yyyy')}
                {isBefore(eq.nextMaintenance, new Date()) && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              {eq.status === 'available' ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setSelectedEq(eq.id)
                    setIsAssignOpen(true)
                  }}
                >
                  Check-out (Alocar Obra)
                </Button>
              ) : eq.status === 'in_use' ? (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => {
                    returnEquipment(eq.id)
                    toast({
                      title: 'Check-in realizado com sucesso.',
                      description: 'Máquina devolvida ao pátio global.',
                    })
                  }}
                >
                  Check-in (Devolver Pátio)
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => {
                    setMaintenanceData({
                      eqId: eq.id,
                      description: '',
                      cost: 0,
                      technician: '',
                    })
                    setIsMaintenanceOpen(true)
                  }}
                >
                  <Wrench className="mr-2 h-4 w-4" /> Finalizar Manutenção
                </Button>
              )}
              {eq.status !== 'maintenance' && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    useEquipmentStore.setState((state) => ({
                      equipment: state.equipment.map((e) =>
                        e.id === eq.id
                          ? { ...e, status: 'maintenance', location: 'Oficina' }
                          : e,
                      ),
                    }))
                    toast({ title: 'Máquina enviada para manutenção.' })
                  }}
                  title="Enviar para Manutenção"
                >
                  <Wrench className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-out: Alocar Máquina</DialogTitle>
            <DialogDescription>
              Selecione a obra que receberá este equipamento. Os custos de
              aluguel serão alocados automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Projeto de Destino</Label>
            <Select onValueChange={(val) => setAssignData({ projectId: val })}>
              <SelectTrigger>
                <SelectValue placeholder={t('general.select')} />
              </SelectTrigger>
              <SelectContent>
                {projects
                  .filter((p) => p.status === 'in_progress')
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>Confirmar Check-out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Manutenção</DialogTitle>
            <DialogDescription>
              Insira os detalhes do serviço realizado e o custo associado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Descrição do Serviço</Label>
              <Input
                value={maintenanceData.description}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    description: e.target.value,
                  })
                }
                placeholder="Ex: Troca de óleo, Filtros..."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Técnico / Oficina</Label>
                <Input
                  value={maintenanceData.technician}
                  onChange={(e) =>
                    setMaintenanceData({
                      ...maintenanceData,
                      technician: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="grid gap-2">
                <Label>Custo Total</Label>
                <CurrencyInput
                  value={maintenanceData.cost}
                  onChange={(val) =>
                    setMaintenanceData({ ...maintenanceData, cost: val })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCompleteMaintenance}
              disabled={!maintenanceData.description}
            >
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
