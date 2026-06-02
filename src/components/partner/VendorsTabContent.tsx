import { useState, useEffect, useMemo } from 'react'
import { useVendorStore, Vendor } from '@/stores/useVendorStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Store,
  ShoppingCart,
  Edit2,
  Trash2,
  PackageOpen,
  MapPin,
  Building2,
  CreditCard,
  Globe,
  Phone,
  Mail,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/stores/useLanguageStore'
// @ts-expect-error
import { useMaterialStore } from '@/stores/useMaterialStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function VendorsTabContent() {
  const { vendors, fetchVendors, addVendor, updateVendor, deleteVendor } =
    useVendorStore()
  const { toast } = useToast()
  const { t, formatCurrency, formatDate } = useLanguageStore()

  const materialOrders = useMaterialStore((state: any) => state.orders || [])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const defaultFormData = {
    name: '',
    document: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    pix_key: '',
    bank_data: { bank: '', agency: '', account: '', accountType: '' },
  }

  const [formData, setFormData] = useState(defaultFormData)
  const [viewHistoryVendor, setViewHistoryVendor] = useState<Vendor | null>(
    null,
  )

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: t('vendor.toast.name_required'),
        variant: 'destructive',
      })
      return
    }
    if (editingVendor) {
      await updateVendor(editingVendor.id, formData)
      toast({ title: t('vendor.toast.updated') })
    } else {
      await addVendor(formData)
      toast({ title: t('vendor.toast.created') })
    }
    setIsModalOpen(false)
    setFormData(defaultFormData)
    setEditingVendor(null)
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      document: vendor.document || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      category: vendor.category || '',
      street: vendor.street || '',
      number: vendor.number || '',
      neighborhood: vendor.neighborhood || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || '',
      pix_key: vendor.pix_key || '',
      bank_data: vendor.bank_data || defaultFormData.bank_data,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('vendor.toast.delete_confirm'))) {
      await deleteVendor(id)
      toast({ title: t('vendor.toast.deleted') })
    }
  }

  const openHistory = (vendor: Vendor) => {
    setViewHistoryVendor(vendor)
  }

  const vendorOrders = useMemo(() => {
    if (!viewHistoryVendor) return []
    return materialOrders.filter(
      (o: any) =>
        o.vendorName === viewHistoryVendor.name ||
        o.vendorId === viewHistoryVendor.id,
    )
  }, [viewHistoryVendor, materialOrders])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> {t('vendor.title')}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t('vendor.desc')}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingVendor(null)
            setFormData(defaultFormData)
            setIsModalOpen(true)
          }}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> {t('vendor.new_btn')}
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Store className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground mb-1">
              {t('vendor.empty.title')}
            </p>
            <p className="text-sm mb-4 text-center max-w-sm">
              {t('vendor.empty.desc')}
            </p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              {t('vendor.empty.btn')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="flex flex-col group hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative">
                <div className="pr-12">
                  <CardTitle
                    className="text-base leading-tight"
                    title={vendor.name}
                  >
                    {vendor.name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex flex-col gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal w-fit"
                    >
                      {vendor.category
                        ? t(`category.${vendor.category.toLowerCase()}`) ||
                          vendor.category
                        : t('vendor.general')}
                    </Badge>
                    {vendor.document && (
                      <span className="text-xs">
                        {t('vendor.cnpj').replace('{doc}', vendor.document)}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-1 absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 hover:bg-muted"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive bg-background/80 hover:bg-destructive/10"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-4">
                <div className="text-sm space-y-2 mb-4 bg-muted/30 p-3 rounded-lg border border-transparent group-hover:border-muted transition-colors">
                  <p className="flex items-center gap-2 text-xs">
                    <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate" title={vendor.email || ''}>
                      {vendor.email || '-'}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{vendor.phone || '-'}</span>
                  </p>
                  {vendor.city && (
                    <p className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {vendor.city} - {vendor.state}
                      </span>
                    </p>
                  )}
                  {vendor.pix_key && (
                    <p className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CreditCard className="h-3 w-3" />{' '}
                      {t('vendor.pix_registered')}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700 border-blue-100 transition-colors"
                  onClick={() => openHistory(vendor)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />{' '}
                  {t('vendor.purchase_history')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl">
              {editingVendor
                ? t('vendor.modal.edit_title')
                : t('vendor.modal.new_title')}
            </DialogTitle>
            <CardDescription>{t('vendor.modal.desc')}</CardDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="geral">
                  <Building2 className="w-4 h-4 mr-2" />{' '}
                  {t('vendor.modal.tab.general')}
                </TabsTrigger>
                <TabsTrigger value="endereco">
                  <MapPin className="w-4 h-4 mr-2" />{' '}
                  {t('vendor.modal.tab.address')}
                </TabsTrigger>
                <TabsTrigger value="financeiro">
                  <CreditCard className="w-4 h-4 mr-2" />{' '}
                  {t('vendor.modal.tab.finance')}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="geral"
                className="space-y-4 animate-in fade-in-50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>
                      {t('vendor.modal.name')}{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={t('vendor.modal.name_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.doc')}</Label>
                    <Input
                      value={formData.document}
                      onChange={(e) =>
                        setFormData({ ...formData, document: e.target.value })
                      }
                      placeholder={t('vendor.modal.doc_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.category')}</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder={t('vendor.modal.category_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.email')}</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={t('vendor.modal.email_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.phone')}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={t('vendor.modal.phone_placeholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t('vendor.modal.website')}</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground">
                        <Globe className="w-4 h-4" />
                      </span>
                      <Input
                        className="rounded-l-none"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        placeholder={t('vendor.modal.website_placeholder')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="endereco"
                className="space-y-4 animate-in fade-in-50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label>{t('vendor.modal.zip')}</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) =>
                        setFormData({ ...formData, zip_code: e.target.value })
                      }
                      placeholder={t('vendor.modal.zip_placeholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t('vendor.modal.street')}</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder={t('vendor.modal.street_placeholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>{t('vendor.modal.number')}</Label>
                    <Input
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                      placeholder={t('vendor.modal.number_placeholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t('vendor.modal.neighborhood')}</Label>
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          neighborhood: e.target.value,
                        })
                      }
                      placeholder={t('vendor.modal.neighborhood_placeholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t('vendor.modal.city')}</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder={t('vendor.modal.city_placeholder')}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>{t('vendor.modal.state')}</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder={t('vendor.modal.state_placeholder')}
                      maxLength={2}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="financeiro"
                className="space-y-4 animate-in fade-in-50"
              >
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900 mb-4">
                  <div className="space-y-2">
                    <Label className="text-emerald-800 dark:text-emerald-400">
                      {t('vendor.modal.pix')}
                    </Label>
                    <Input
                      value={formData.pix_key}
                      onChange={(e) =>
                        setFormData({ ...formData, pix_key: e.target.value })
                      }
                      placeholder={t('vendor.modal.pix_placeholder')}
                      className="border-emerald-200 dark:border-emerald-800"
                    />
                  </div>
                </div>

                <h4 className="font-semibold text-sm mb-2 mt-6">
                  {t('vendor.modal.bank_data')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.bank')}</Label>
                    <Input
                      value={formData.bank_data.bank}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_data: {
                            ...formData.bank_data,
                            bank: e.target.value,
                          },
                        })
                      }
                      placeholder={t('vendor.modal.bank_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.agency')}</Label>
                    <Input
                      value={formData.bank_data.agency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_data: {
                            ...formData.bank_data,
                            agency: e.target.value,
                          },
                        })
                      }
                      placeholder={t('vendor.modal.agency_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.account')}</Label>
                    <Input
                      value={formData.bank_data.account}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_data: {
                            ...formData.bank_data,
                            account: e.target.value,
                          },
                        })
                      }
                      placeholder={t('vendor.modal.account_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendor.modal.account_type')}</Label>
                    <Input
                      value={formData.bank_data.accountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_data: {
                            ...formData.bank_data,
                            accountType: e.target.value,
                          },
                        })
                      }
                      placeholder={t('vendor.modal.account_type_placeholder')}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              {t('vendor.modal.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('vendor.modal.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog
        open={!!viewHistoryVendor}
        onOpenChange={(open) => !open && setViewHistoryVendor(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              {t('vendor.history.title').replace(
                '{name}',
                viewHistoryVendor?.name || '',
              )}
            </DialogTitle>
            <CardDescription>{t('vendor.history.desc')}</CardDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
            {vendorOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed flex flex-col items-center">
                <PackageOpen className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-medium text-foreground">
                  {t('vendor.history.empty.title')}
                </p>
                <p className="text-sm">{t('vendor.history.empty.desc')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorOrders.map((order: any) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden border-muted shadow-sm"
                  >
                    <div className="bg-muted/30 p-3 px-4 border-b flex justify-between items-center text-sm">
                      <div className="font-semibold text-primary flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        {t('vendor.history.order').replace(
                          '{id}',
                          order.id?.substring(0, 6).toUpperCase(),
                        )}
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-muted-foreground text-xs font-medium">
                          {formatDate && order.date
                            ? formatDate(order.date, 'dd/MM/yyyy')
                            : order.date}
                        </span>
                        {order.projectId && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 text-[10px]"
                          >
                            {t('vendor.history.linked')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2.5">
                        {order.items?.map((item: any, idx: number) => (
                          <li
                            key={idx}
                            className="flex justify-between items-start text-sm group"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="bg-muted/50 p-1.5 rounded mt-0.5">
                                <PackageOpen className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  {item.material?.name || item.name}
                                </span>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {item.quantity}{' '}
                                  {item.material?.unit || item.unit || 'un'} x{' '}
                                  {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                            </div>
                            <span className="font-semibold tabular-nums mt-1">
                              {formatCurrency(
                                item.total || item.quantity * item.unitPrice,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {t('vendor.history.total')}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />{' '}
                            {t('vendor.history.integrated')}
                          </span>
                        </div>
                        <span className="font-bold text-lg text-primary tabular-nums">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
