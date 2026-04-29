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
    toast({ title: 'Categoria adicionada com sucesso' })
  }

  const handleDelete = (id: string) => {
    removeCategory(id)
    toast({ title: 'Categoria removida com sucesso' })
  }

  const getTypeLabel = (type: CategoryType) => {
    switch (type) {
      case 'job':
        return 'Serviços/Vagas'
      case 'marketplace':
        return 'Vendas'
      case 'rental':
        return 'Locações'
      case 'donation':
        return 'Doação'
      default:
        return 'Outros'
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
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">Serviços/Vagas</SelectItem>
                <SelectItem value="marketplace">Vendas</SelectItem>
                <SelectItem value="rental">Locações</SelectItem>
                <SelectItem value="donation">Doação</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Qtd. Subcategorias</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
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
                    {category.subCategories.length} subcategoria(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/categories/${category.id}`}>
                          <Edit2 className="mr-2 h-4 w-4" /> Editar Detalhes
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
                              Excluir categoria?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação removerá a categoria "{category.name}" e
                              todas as suas subcategorias associadas. Esta ação
                              não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
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
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
