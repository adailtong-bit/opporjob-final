import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Loader2, KeyRound } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const { updatePassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we have an error in the hash fragment from a bad link
    const hash = window.location.hash
    if (hash && hash.includes('error_description')) {
      const urlParams = new URLSearchParams(hash.substring(1))
      const errorDesc = urlParams.get('error_description')
      if (errorDesc) {
        toast({
          variant: 'destructive',
          title: 'Link inválido ou expirado',
          description: errorDesc.replace(/\+/g, ' '),
        })
        navigate('/forgot-password')
      }
    }
  }, [navigate, toast])

  const passwordSchema = z
    .object({
      password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    const { error } = await updatePassword(data.password)
    setIsLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: error.message,
      })
    } else {
      toast({
        title: 'Password updated',
        description: 'Your password was changed successfully!',
      })
      navigate('/dashboard')
    }
  }

  return (
    <div className="space-y-6 w-full max-w-[380px] mx-auto px-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">New Password</h1>
        <p className="text-muted-foreground text-sm">
          Create a new secure password for your access.
        </p>
      </div>

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="bg-background h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
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
            Save and Sign In
          </Button>
        </form>
      </Form>
    </div>
  )
}
