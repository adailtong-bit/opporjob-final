import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Plus, Trash2, Save } from 'lucide-react'

export default function ManageMarketing() {
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentId, setContentId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [features, setFeatures] = useState<{ title: string; desc: string }[]>(
    [],
  )

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('key', 'login_page')
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error on first load

      if (data) {
        setContentId(data.id)
        setTitle(data.title || '')
        setSubtitle(data.subtitle || '')
        setFeatures(data.features || [])
      }
    } catch (error) {
      console.error('Error fetching marketing content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        key: 'login_page',
        title,
        subtitle,
        features,
      }

      let error

      if (contentId) {
        const { error: updateError } = await supabase
          .from('marketing_content')
          .update(payload)
          .eq('id', contentId)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('marketing_content')
          .insert([payload])
        error = insertError
      }

      if (error) throw error

      toast({
        title: t('success'),
        description: 'Marketing content updated successfully.',
      })

      fetchContent()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message || 'Failed to update content',
      })
    } finally {
      setSaving(false)
    }
  }

  const addFeature = () => {
    setFeatures([...features, { title: '', desc: '' }])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (
    index: number,
    field: 'title' | 'desc',
    value: string,
  ) => {
    const newFeatures = [...features]
    newFeatures[index][field] = value
    setFeatures(newFeatures)
  }

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('admin.marketing.title')}
        </h2>
        <p className="text-muted-foreground">{t('admin.marketing.desc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login Page Content</CardTitle>
          <CardDescription>
            Update the text that appears on the left side of the login page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('admin.marketing.form.title')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build, renovate and innovate."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('admin.marketing.form.subtitle')}
            </label>
            <Textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Complete platform for projects..."
              rows={3}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t('admin.marketing.features')}
              </h3>
              <Button onClick={addFeature} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.marketing.add_feature')}
              </Button>
            </div>

            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20 relative group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex-1 space-y-4 pr-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('admin.marketing.feature.title')}
                    </label>
                    <Input
                      value={feature.title}
                      onChange={(e) =>
                        updateFeature(index, 'title', e.target.value)
                      }
                      placeholder="e.g. Specialized Professionals"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('admin.marketing.feature.desc')}
                    </label>
                    <Textarea
                      value={feature.desc}
                      onChange={(e) =>
                        updateFeature(index, 'desc', e.target.value)
                      }
                      placeholder="e.g. Find the best talent for your projects."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('admin.marketing.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
