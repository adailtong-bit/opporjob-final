import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Mail } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

export default function ContactUs() {
  const { t } = useLanguageStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error(t('contact.validation.required'))
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('contact_requests').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          status: 'pending',
        },
      ])

      if (error) throw error

      toast.success(t('contact.success'))
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || t('contact.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in-up">
      <Card className="border-2 shadow-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {t('contact.title')}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {t('contact.desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="name">{t('contact.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('contact.name_placeholder')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="email">{t('contact.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('contact.email_placeholder')}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="phone">{t('contact.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('contact.phone_placeholder')}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="subject">{t('contact.subject')}</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(val) =>
                    setFormData({ ...formData, subject: val })
                  }
                  required
                >
                  <SelectTrigger id="subject">
                    <SelectValue
                      placeholder={t('contact.subject_placeholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Partnership">
                      {t('contact.subject.partnership')}
                    </SelectItem>
                    <SelectItem value="Support">
                      {t('contact.subject.support')}
                    </SelectItem>
                    <SelectItem value="Interest in Services">
                      {t('contact.subject.interest')}
                    </SelectItem>
                    <SelectItem value="Other">
                      {t('contact.subject.other')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="message">{t('contact.message')}</Label>
              <Textarea
                id="message"
                placeholder={t('contact.message_placeholder')}
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                className="resize-y"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Mail className="w-5 h-5 mr-2" />
              )}
              {loading ? t('contact.sending') : t('contact.send')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
