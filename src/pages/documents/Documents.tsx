import { useState, useRef, useCallback } from 'react'
import { useDocumentStore, Document } from '@/stores/useDocumentStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal'

export default function Documents() {
  const { documents, addDocument, deleteDocument } = useDocumentStore()
  const { t } = useLanguageStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf'))
      return <FileText className="h-5 w-5 text-red-500" />
    if (type.includes('image'))
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    if (type.includes('sheet') || type.includes('excel'))
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const simulateUpload = async (file: File) => {
    setIsUploading(true)
    setCurrentFile(file)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    await new Promise((resolve) => setTimeout(resolve, 2500))
    clearInterval(interval)

    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      createdAt: new Date(),
      status: 'completed',
    }

    addDocument(newDoc)
    setIsUploading(false)
    setCurrentFile(null)
    setUploadProgress(0)

    toast({
      title: t('docs.toast.upload_title'),
      description: t('docs.toast.upload_desc').replace('{name}', file.name),
    })
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: t('docs.toast.large_title'),
        description: t('docs.toast.large_desc'),
      })
      return
    }
    simulateUpload(file)
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('docs.page_title')}
        </h1>
        <p className="text-muted-foreground">{t('docs.page_desc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('docs.upload_card_title')}</CardTitle>
          <CardDescription>{t('docs.upload_card_desc')}</CardDescription>
        </CardHeader>{' '}
        <CardContent>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-4',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
              isUploading && 'pointer-events-none opacity-50',
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isUploading}
            />

            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t('docs.upload_interaction')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('docs.upload_format')}
              </p>
            </div>
          </div>

          {isUploading && currentFile && (
            <div className="mt-6 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{currentFile.name}</span>
                </div>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t('docs.recent')}
        </h2>

        {documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <File className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">{t('docs.empty_title')}</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                {t('docs.empty_desc')}
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('docs.upload_btn')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('docs.table.name')}</TableHead>
                  <TableHead>{t('docs.size')}</TableHead>
                  <TableHead>{t('docs.upload_date')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>
                      {format(doc.createdAt, "d 'de' MMMM, yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewDoc(doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('view')}
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('delete')}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('sched.delete_confirm_title')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('sched.delete_confirm_desc')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    deleteDocument(doc.id)
                                    toast({
                                      title: t('docs.delete_success'),
                                      description: t(
                                        'docs.delete_success_desc',
                                      ),
                                    })
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t('delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DocumentPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  )
}
