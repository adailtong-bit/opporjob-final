import { useState, useEffect } from 'react'
import { useVendorStore, Vendor, VendorContact } from '@/stores/useVendorStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, MapPin, Building2, Users, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AdvertisersTab() {
  const { vendors, fetchVendors, addVendor, updateVendor, deleteVendor } =
    useVendorStore()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const defaultFormData = {
    name: '',
    company_name: '',
    document: '',
    tax_id: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    pix_key: '',
    bank_data: { bank: '', agency: '', account: '', accountType: '' },
    vendor_contacts: [
      { name: '', email: '', phone: '', role: 'Manager' },
    ] as VendorContact[],
  }

  const [formData, setFormData] = useState(defaultFormData)

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      company_name: vendor.company_name || '',
      document: vendor.document || '',
      tax_id: vendor.tax_id || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      category: vendor.category || '',
      street: vendor.street || '',
      number: vendor.number || '',
      complement: vendor.complement || '',
      neighborhood: vendor.neighborhood || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || '',
      pix_key: vendor.pix_key || '',
      bank_data: vendor.bank_data || defaultFormData.bank_data,
      vendor_contacts: vendor.vendor_contacts?.length
        ? vendor.vendor_contacts
        : [{ name: '', email: '', phone: '', role: 'Manager' }],
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this advertiser?')) {
      await deleteVendor(id)
      toast({ title: 'Advertiser deleted successfully' })
    }
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: 'Name is required', variant: 'destructive' })
      return
    }

    const financialContact = formData.vendor_contacts.find(
      (c) => c.role === 'Financial',
    )
    let financial_email = financialContact?.email || formData.email || null

    const dataToSave = {
      ...formData,
      financial_email,
    }

    if (editingVendor) {
      await updateVendor(editingVendor.id, dataToSave)
      toast({ title: 'Advertiser updated successfully' })
    } else {
      await addVendor(dataToSave)
      toast({ title: 'Advertiser created successfully' })
    }

    setIsModalOpen(false)
    setFormData(defaultFormData)
    setEditingVendor(null)
  }

  const addContact = () => {
    setFormData({
      ...formData,
      vendor_contacts: [
        ...formData.vendor_contacts,
        { name: '', email: '', phone: '', role: 'Others' },
      ],
    })
  }

  const removeContact = (index: number) => {
    const newContacts = [...formData.vendor_contacts]
    newContacts.splice(index, 1)
    setFormData({ ...formData, vendor_contacts: newContacts })
  }

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...formData.vendor_contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setFormData({ ...formData, vendor_contacts: newContacts })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingVendor(null)
            setFormData(defaultFormData)
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Advertiser
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Financial Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <div className="font-medium">{vendor.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {vendor.company_name}
                  </div>
                  {vendor.tax_id && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Tax ID: {vendor.tax_id}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {vendor.city && vendor.state
                    ? `${vendor.city}, ${vendor.state}`
                    : '-'}
                </TableCell>
                <TableCell>
                  {vendor.vendor_contacts &&
                  vendor.vendor_contacts.length > 0 ? (
                    <div className="space-y-1">
                      {vendor.vendor_contacts.slice(0, 2).map((c, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold">{c.name}</span> (
                          {c.role})
                        </div>
                      ))}
                      {vendor.vendor_contacts.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{vendor.vendor_contacts.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{vendor.financial_email || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No advertisers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>
              {editingVendor ? 'Edit Advertiser' : 'Create Advertiser'}
            </DialogTitle>
            <DialogDescription>
              Manage the advertiser's details and B2B contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 sticky top-0 bg-background z-10">
                <TabsTrigger value="general">
                  <Building2 className="w-4 h-4 mr-2" /> Company
                </TabsTrigger>
                <TabsTrigger value="address">
                  <MapPin className="w-4 h-4 mr-2" /> Address
                </TabsTrigger>
                <TabsTrigger value="contacts">
                  <Users className="w-4 h-4 mr-2" /> Contacts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Brand Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_name: e.target.value,
                        })
                      }
                      placeholder="Legal Entity Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax ID</Label>
                    <Input
                      value={formData.tax_id}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_id: e.target.value })
                      }
                      placeholder="EIN / CNPJ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>General Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>General Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Website</Label>
                    <Input
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label>Zip Code</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) =>
                        setFormData({ ...formData, zip_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Street</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>Number</Label>
                    <Input
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>Complement</Label>
                    <Input
                      value={formData.complement}
                      onChange={(e) =>
                        setFormData({ ...formData, complement: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>Neighborhood</Label>
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          neighborhood: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>State</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Add at least 3 contacts. Designate one as "Financial" for
                  receiving invoices.
                </div>

                {formData.vendor_contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-muted/20 relative"
                  >
                    {formData.vendor_contacts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeContact(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>Contact Name *</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) =>
                            updateContact(index, 'name', e.target.value)
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={contact.role}
                          onValueChange={(val) =>
                            updateContact(index, 'role', val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Financial">Financial</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) =>
                            updateContact(index, 'email', e.target.value)
                          }
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={contact.phone || ''}
                          onChange={(e) =>
                            updateContact(index, 'phone', e.target.value)
                          }
                          placeholder="+1 555-0000"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  type="button"
                  onClick={addContact}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Another Contact
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background rounded-b-lg">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Advertiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
