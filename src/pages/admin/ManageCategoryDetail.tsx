import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCategoryStore, SubCategory } from '@/stores/useCategoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Save, Plus, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ManageCategoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const {
    categories,
    updateCategory,
    addSubCategory,
    updateSubCategory,
    removeSubCategory,
  } = useCategoryStore()

  const category = categories.find((c) => c.id === id)

  const [catName, setCatName] = useState('')

  // Add Subcategory State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newSubName, setNewSubName] = useState('')

  // Edit Subcategory State
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null)
  const [editSubName, setEditSubName] = useState('')

  // Delete Subcategory State
  const [subToDelete, setSubToDelete] = useState<SubCategory | null>(null)

  useEffect(() => {
    if (category) {
      setCatName(category.name)
    }
  }, [category])

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">
          {t('admin.categories.not_found')}
        </h2>
        <Button onClick={() => navigate('/admin/categories')}>
          {t('admin.categories.back')}
        </Button>
      </div>
    )
  }

  // Handle Category Name Update
  const handleUpdateCategory = () => {
    if (!catName.trim()) {
      toast({
        variant: 'destructive',
        title: t('admin.categories.name_empty'),
      })
      return
    }
    updateCategory(category.id, catName.trim())
    toast({ title: t('admin.categories.update_success') })
  }

  // Handle Add Subcategory
  const handleAddSub = () => {
    if (!newSubName.trim()) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('admin.subcat.name_empty'),
      })
      return
    }
    addSubCategory(category.id, newSubName.trim())
    setNewSubName('')
    setIsAddOpen(false)
    toast({ title: t('success'), description: t('admin.subcat.add_success') })
  }

  // Handle Edit Subcategory
  const handleEditSub = () => {
    if (!editingSub || !editSubName.trim()) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('admin.subcat.name_empty'),
      })
      return
    }
    updateSubCategory(category.id, editingSub.id, editSubName.trim())
    setEditingSub(null)
    toast({
      title: t('success'),
      description: t('admin.subcat.update_success'),
    })
  }

  // Handle Delete Subcategory
  const confirmDeleteSub = () => {
    if (subToDelete) {
      removeSubCategory(category.id, subToDelete.id)
      setSubToDelete(null)
      toast({
        title: t('success'),
        description: t('admin.subcat.delete_success'),
      })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.categories.edit_title')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.categories.managing')}{' '}
            {category.translationKey
              ? t(category.translationKey)
              : category.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.categories.details_title')}</CardTitle>
          <CardDescription>
            {t('admin.categories.details_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="catName">
                {t('admin.categories.name_label')}
              </Label>
              <Input
                id="catName"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateCategory} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> {t('admin.categories.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('admin.categories.subcats_title')}</CardTitle>
            <CardDescription>
              {t('admin.categories.subcats_desc')}
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> {t('admin.categories.add_subcat')}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.categories.subcat_name')}</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.subCategories.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.translationKey ? t(sub.translationKey) : sub.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded border">
                      {sub.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingSub(sub)
                          setEditSubName(sub.name)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSubToDelete(sub)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {category.subCategories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('admin.categories.no_subcats')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Subcategory Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.categories.new_subcat_title')}</DialogTitle>
            <DialogDescription>
              {t('admin.categories.new_subcat_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newSubName">{t('admin.categories.name')}</Label>
            <Input
              id="newSubName"
              className="mt-2"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddSub}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Modal */}
      <Dialog
        open={!!editingSub}
        onOpenChange={(open) => !open && setEditingSub(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.categories.edit_subcat_title')}</DialogTitle>
            <DialogDescription>
              {t('admin.categories.edit_subcat_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editSubName">{t('admin.categories.name')}</Label>
            <Input
              id="editSubName"
              className="mt-2"
              value={editSubName}
              onChange={(e) => setEditSubName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditSub()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSub(null)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEditSub}>
              {t('admin.categories.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={!!subToDelete}
        onOpenChange={(open) => !open && setSubToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.categories.delete_sub_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.categories.delete_sub_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSub}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
