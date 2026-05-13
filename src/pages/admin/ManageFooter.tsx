import { useState, useEffect } from 'react'
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
import { Save } from 'lucide-react'

export default function ManageFooter() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    aboutUs: '',
    ourCompany: '',
    ourMission: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    copyright: '',
  })

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('*')
        .eq('key', 'footer')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSettingsId(data.id)
        if (data.value) {
          setFormData({
            aboutUs: data.value.aboutUs || '',
            ourCompany: data.value.ourCompany || '',
            ourMission: data.value.ourMission || '',
            contactEmail: data.value.contactEmail || '',
            contactPhone: data.value.contactPhone || '',
            contactAddress: data.value.contactAddress || '',
            copyright: data.value.copyright || '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching footer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        key: 'footer',
        value: formData,
        updated_at: new Date().toISOString(),
      }

      let error

      if (settingsId) {
        const { error: updateError } = await supabase
          .from('site_settings' as any)
          .update(payload)
          .eq('id', settingsId)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('site_settings' as any)
          .insert([payload])
        error = insertError
      }

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Rodapé atualizado com sucesso.',
      })

      fetchFooterData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Falha ao atualizar o rodapé',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rodapé do Site</h2>
        <p className="text-muted-foreground">
          Gerencie as informações institucionais do rodapé.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do Rodapé</CardTitle>
          <CardDescription>
            Atualize os textos que aparecem na parte inferior do site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sobre Nós (About Us)</label>
            <Textarea
              value={formData.aboutUs}
              onChange={(e) => handleChange('aboutUs', e.target.value)}
              placeholder="Descreva sobre a plataforma..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nossa Empresa (Our Company)
            </label>
            <Textarea
              value={formData.ourCompany}
              onChange={(e) => handleChange('ourCompany', e.target.value)}
              placeholder="Descreva sobre a empresa..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nossa Missão (Our Mission)
            </label>
            <Textarea
              value={formData.ourMission}
              onChange={(e) => handleChange('ourMission', e.target.value)}
              placeholder="Descreva a missão..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email de Contato</label>
              <Input
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="ex: contato@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone de Contato</label>
              <Input
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="ex: +55 11 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <Input
              value={formData.contactAddress}
              onChange={(e) => handleChange('contactAddress', e.target.value)}
              placeholder="ex: Rua Exemplo, 123 - Cidade"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Copyright (Texto de Direitos Autorais)
            </label>
            <Input
              value={formData.copyright}
              onChange={(e) => handleChange('copyright', e.target.value)}
              placeholder="ex: © 2026 Empresa. Todos os direitos reservados."
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
