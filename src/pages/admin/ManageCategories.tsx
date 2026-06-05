import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategoryStore, CategoryType } from '@/stores/useCategoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ManageCategories() {
  const { categories, addCategory, removeCategory } = useCategoryStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [newCategory, setNewCategory] = useState('')
  const [newType, setNewType] = useState<CategoryType>('job')

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage))
  const currentCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleAdd = () => {
    if (!newCategory.trim()) {
      toast({
        title: t('val.required'),
        variant: 'destructive',
      })
      return
    }
    addCategory(newCategory.trim(), newType)
    setNewCategory('')
    setNewType('job')
    toast({ title: t('admin.categories.add_success') })
  }

  const handleDelete = (id: string) => {
    removeCategory(id)
    toast({ title: t('admin.categories.delete_success') })
  }

  const getTypeLabel = (type: CategoryType) => {
    switch (type) {
      case 'job':
        return t('post.type.job.label')
      case 'ad':
        return 'Advertising'
      case 'marketplace':
        return t('post.type.product.label')
      case 'rental':
        return t('post.type.rental.label')
      case 'donation':
        return t('category.donation')
      default:
        return t('role.other')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.categories.title')}
        </h1>
        <p className="text-muted-foreground">{t('admin.categories.desc')}</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg">
            {t('admin.categories.add_title')}
          </CardTitle>
          <CardDescription>{t('admin.categories.add_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder={t('admin.categories.placeholder')}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="max-w-sm"
            />
            <Select
              value={newType}
              onValueChange={(val: CategoryType) => setNewType(val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('proj.approvals.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">
                  {t('post.type.job.label')} (Service)
                </SelectItem>
                <SelectItem value="ad">Advertising (Ads)</SelectItem>
                <SelectItem value="marketplace">
                  {t('post.type.product.label')}
                </SelectItem>
                <SelectItem value="rental">
                  {t('post.type.rental.label')}
                </SelectItem>
                <SelectItem value="donation">
                  {t('category.donation')}
                </SelectItem>
                <SelectItem value="other">{t('role.other')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> {t('add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('market.category')}</TableHead>
                <TableHead>{t('proj.approvals.type')}</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>{t('admin.categories.subcats_count')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.translationKey
                      ? t(category.translationKey)
                      : category.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {getTypeLabel(category.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded border">
                      {category.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    {category.subCategories.length}{' '}
                    {t('admin.categories.subcats')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/categories/${category.id}`}>
                          <Edit2 className="mr-2 h-4 w-4" /> {t('edit')}
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('admin.categories.delete_title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('admin.categories.delete_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('admin.categories.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
