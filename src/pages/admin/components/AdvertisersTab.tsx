import { useState, useEffect } from 'react'
import { useVendorStore, Vendor, VendorContact } from '@/stores/useVendorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Edit2, Plus, Trash2, Building2, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AdvertisersTab() {
  const {
    vendors,
    fetchVendors,
    addVendor,
    updateVendor,
    deleteVendor,
    loading,
  } = useVendorStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Partial<Vendor> | null>(
    null,
  )
  const [contacts, setContacts] = useState<Partial<VendorContact>[]>([])
  const [entityType, setEntityType] = useState<'pf' | 'pj'>('pf')
  const { toast } = useToast()

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const filteredVendors = vendors.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor)
      setContacts(vendor.vendor_contacts || [])
      setEntityType(vendor.company_name ? 'pj' : 'pf')
    } else {
      setEditingVendor({
        status: 'active',
        category: 'Advertising',
      })
      setContacts([])
      setEntityType('pf')
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!editingVendor) return

    try {
      if (editingVendor.id) {
        await updateVendor(editingVendor.id, {
          ...editingVendor,
          vendor_contacts: contacts as VendorContact[],
        })
        toast({ title: 'Advertiser updated successfully' })
      } else {
        await addVendor({
          ...editingVendor,
          vendor_contacts: contacts as VendorContact[],
        })
        toast({ title: 'Advertiser created successfully' })
      }
      setIsModalOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error saving advertiser',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this advertiser?')) {
      await deleteVendor(id)
      toast({ title: 'Advertiser deleted' })
    }
  }

  const addContact = () => {
    setContacts([
      ...contacts,
      { name: '', email: '', phone: '', role: 'Financeiro' },
    ])
  }

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setContacts(newContacts)
  }

  const removeContact = (index: number) => {
    const newContacts = [...contacts]
    newContacts.splice(index, 1)
    setContacts(newContacts)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search advertisers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" /> Add Advertiser
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Advertiser</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No advertisers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    {vendor.company_name ? (
                      <Badge variant="outline">
                        <Building2 className="w-3 h-3 mr-1" /> PJ
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <UserIcon className="w-3 h-3 mr-1" /> PF
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {vendor.company_name ? vendor.company_name : vendor.name}
                    {vendor.company_name && (
                      <div className="text-xs text-muted-foreground">
                        {vendor.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>
                    {vendor.document || vendor.tax_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vendor.status === 'active' ? 'default' : 'secondary'
                      }
                      className={
                        vendor.status === 'active'
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenModal(vendor)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(vendor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVendor?.id ? 'Edit Advertiser' : 'New Advertiser'}
            </DialogTitle>
          </DialogHeader>

          {editingVendor && (
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Basic Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Type</Label>
                    <Select
                      value={entityType}
                      onValueChange={(val: 'pf' | 'pj') => {
                        setEntityType(val)
                        if (val === 'pf')
                          setEditingVendor({
                            ...editingVendor,
                            company_name: '',
                          })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pf">Pessoa Física (PF)</SelectItem>
                        <SelectItem value="pj">Pessoa Jurídica (PJ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingVendor.status || 'active'}
                      onValueChange={(val) =>
                        setEditingVendor({ ...editingVendor, status: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {entityType === 'pj' && (
                    <div className="space-y-2 col-span-2">
                      <Label>Company Name (Razão Social)</Label>
                      <Input
                        value={editingVendor.company_name || ''}
                        onChange={(e) =>
                          setEditingVendor({
                            ...editingVendor,
                            company_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>
                      {entityType === 'pj' ? 'Contact Name' : 'Full Name'}
                    </Label>
                    <Input
                      value={editingVendor.name || ''}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{entityType === 'pj' ? 'CNPJ' : 'CPF'}</Label>
                    <Input
                      value={editingVendor.document || ''}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          document: e.target.value,
                        })
                      }
                      placeholder={
                        entityType === 'pj'
                          ? '00.000.000/0000-00'
                          : '000.000.000-00'
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Email</Label>
                    <Input
                      type="email"
                      value={editingVendor.email || ''}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Phone</Label>
                    <Input
                      value={editingVendor.phone || ''}
                      onChange={(e) =>
                        setEditingVendor({
                          ...editingVendor,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-semibold">Contacts</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContact}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Contact
                  </Button>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                    No contacts added. Click the button above to add one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start p-4 border rounded-md relative bg-muted/20"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 text-destructive hover:bg-destructive/20"
                          onClick={() => removeContact(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4 flex-1 pr-8">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={contact.name || ''}
                              onChange={(e) =>
                                updateContact(index, 'name', e.target.value)
                              }
                              size={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Role</Label>
                            <Select
                              value={contact.role || 'Outros'}
                              onValueChange={(val) =>
                                updateContact(index, 'role', val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Financeiro">
                                  Financeiro
                                </SelectItem>
                                <SelectItem value="Gerente">Gerente</SelectItem>
                                <SelectItem value="Dono">Dono</SelectItem>
                                <SelectItem value="Marketing">
                                  Marketing
                                </SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Email</Label>
                            <Input
                              type="email"
                              value={contact.email || ''}
                              onChange={(e) =>
                                updateContact(index, 'email', e.target.value)
                              }
                              size={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input
                              value={contact.phone || ''}
                              onChange={(e) =>
                                updateContact(index, 'phone', e.target.value)
                              }
                              size={1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Advertiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
