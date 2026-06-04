import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Upload, Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function ProjectUpdates({ projectId }: { projectId: string }) {
  const { getProject, addProjectUpdate } = useProjectStore()
  const { t, formatDate } = useLanguageStore()
  const { toast } = useToast()
  const { user } = useAuth()

  const project = getProject(projectId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)
    setUploadingFiles(true)
    const newPhotos: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${user?.id || 'guest'}/${fileName}`

      const { error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file)
      if (!error) {
        const { data } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath)
        newPhotos.push(data.publicUrl)
      } else {
        newPhotos.push(URL.createObjectURL(file))
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setUploadingFiles(false)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      toast({ variant: 'destructive', title: t('val.title_required') })
      return
    }

    setLoading(true)

    await supabase.from('project_updates').insert({
      project_id: projectId,
      title,
      description,
      photos,
    })

    addProjectUpdate(projectId, { title, description, photos })

    setLoading(false)
    setIsOpen(false)
    setTitle('')
    setDescription('')
    setPhotos([])
    toast({ title: t('success') })
  }

  const [dbUpdates, setDbUpdates] = useState<any[]>([])

  useEffect(() => {
    if (project?.is_demo || true) {
      supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .then(({ data }) => {
          if (data) {
            setDbUpdates(
              data.map((u) => ({
                id: u.id,
                title: u.title,
                description: u.description,
                photos: u.photos || [],
                createdAt: u.created_at,
              })),
            )
          }
        })
    }
  }, [project, projectId])

  if (!project) return null

  const allUpdates = [
    ...(project.updates || []),
    ...dbUpdates.filter(
      (du) => !(project.updates || []).some((pu: any) => pu.id === du.id),
    ),
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">
            {t('proj.updates.title') || 'Project Updates'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('proj.updates.desc') || 'Track progress with photos and notes.'}
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('proj.updates.add_btn') || 'Add Update'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {t('proj.updates.modal_title') || 'New Project Update'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('proj.updates.stage_title') || 'Stage Title'}
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('proj.updates.stage_desc') || 'Description'}
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('proj.new.photos_title') || 'Photos'}
                </label>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
                      >
                        <img
                          src={photo}
                          alt="Upload preview"
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingFiles ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t('proj.new.photos_placeholder') ||
                      'Upload or drag and drop images here'}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || uploadingFiles}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('proj.updates.submit') || 'Save Update'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Initial Photos Display */}
      {project.photos && project.photos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t('proj.new.photos_subtitle') || 'Initial Photos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {project.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden border shadow-sm"
                >
                  <img
                    src={photo}
                    alt={`Initial ${idx}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updates List */}
      <div className="mt-8">
        {allUpdates.length > 0 ? (
          <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
            {allUpdates
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((update) => (
                <div key={update.id} className="relative pl-6 sm:pl-8">
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <CardTitle className="text-lg">
                          {update.title}
                        </CardTitle>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">
                          {formatDate(update.createdAt, 'PPP')}
                        </span>
                      </div>
                      {update.description && (
                        <CardDescription className="mt-1 text-sm text-foreground/80">
                          {update.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {update.photos && update.photos.length > 0 && (
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {update.photos.map((photo: string, idx: number) => (
                            <div
                              key={idx}
                              className="aspect-square rounded-md overflow-hidden border shadow-sm"
                            >
                              <img
                                src={photo}
                                alt={`${update.title} ${idx}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium">
              {t('proj.updates.title') || 'Project Updates'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto mb-4">
              {t('proj.updates.desc') ||
                'Track progress with photos and notes.'}
            </p>
            <Button size="sm" onClick={() => setIsOpen(true)}>
              Create First Update
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
