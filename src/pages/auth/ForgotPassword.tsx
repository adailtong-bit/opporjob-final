import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuth } from '@/hooks/use-auth'

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const navigate = useNavigate()

  const emailSchema = z.object({
    email: z.string().email(t('val.email') || 'Email inválido'),
  })

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    setEmail(data.email)
    const { error } = await resetPassword(
      data.email,
      `${window.location.origin}/reset-password`,
    )
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      })
    } else {
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada.',
      })
      setStep(2)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-[380px] mx-auto px-4">
      <Link
        to="/login"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('auth.forgot.back')}
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4">
          {step === 2 ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <KeyRound className="h-6 w-6" />
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {step === 1 && t('auth.forgot.title')}
          {step === 2 && 'Verifique seu e-mail'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {step === 1 && t('auth.forgot.desc')}
          {step === 2 &&
            `Enviamos um link de recuperação para o e-mail ${email}. Clique nele para criar uma nova senha.`}
        </p>
      </div>

      {step === 1 && (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      {...field}
                      className="bg-background h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {t('auth.forgot.send')}
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <div className="space-y-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-primary hover:underline mt-4"
          >
            Tentar outro e-mail
          </button>
        </div>
      )}
    </div>
  )
}
