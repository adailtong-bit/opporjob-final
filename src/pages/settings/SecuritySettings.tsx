import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { useToast } from '@/hooks/use-toast'
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useAuth } from '@/hooks/use-auth'

export function SecuritySettings() {
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const { user, signIn, updatePassword } = useAuth()

  const [mfaEnrolled, setMfaEnrolled] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [secret, setSecret] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setMfaEnrolled(data?.currentLevel === 'aal2' || data?.nextLevel === 'aal2')
  }

  const enrollMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })
      if (error) throw error
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'MFA Error',
        description: error.message,
      })
    }
  }

  const verifyMfa = async () => {
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })
      if (verify.error) throw verify.error
      toast({ title: 'Success', description: 'MFA activated successfully!' })
      setMfaEnrolled(true)
      setQrCode('')
      setSecret('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: error.message,
      })
    }
  }

  const disableMfa = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors()
      const totpFactor = data?.totp[0]
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        })
        if (error) throw error
        setMfaEnrolled(false)
        toast({
          title: 'MFA Disabled',
          description: 'Two-factor authentication has been removed.',
        })
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    }
  }

  const handleUpdatePassword = async () => {
    if (!user?.email) return

    if (newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description:
          t('auth.password.min_length') ||
          'Password must be at least 8 characters',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description:
          t('auth.password.mismatch') || 'New passwords do not match',
      })
      return
    }

    setLoadingPass(true)

    const { error: signInError } = await signIn(user.email, currentPassword)

    if (signInError) {
      setLoadingPass(false)
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description:
          t('auth.password.current_incorrect') ||
          'Current password is incorrect',
      })
      return
    }

    const { error: updateError } = await updatePassword(newPassword)

    setLoadingPass(false)

    if (updateError) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: updateError.message,
      })
    } else {
      toast({
        title: t('success') || 'Success',
        description:
          t('auth.password.success') || 'Password updated successfully',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('auth.password.change_title') || 'Change Password'}{' '}
            <KeyRound className="w-5 h-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Update your account password securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>{t('auth.password.current') || 'Current Password'}</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2 relative">
              <Label>{t('auth.password.new') || 'New Password'}</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 relative">
              <Label>
                {t('auth.password.confirm') || 'Confirm New Password'}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleUpdatePassword}
              disabled={
                loadingPass ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {loadingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.password.update_button') || 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Security <ShieldAlert className="w-5 h-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Protect your account with multi-factor authentication (MFA).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                2-Step Authentication{' '}
                {mfaEnrolled && (
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                )}
              </h4>
              <p className="text-sm text-muted-foreground">
                {mfaEnrolled
                  ? 'MFA is active on your account.'
                  : 'Add an extra layer of security.'}
              </p>
            </div>
            {mfaEnrolled ? (
              <Button variant="destructive" onClick={disableMfa}>
                Disable MFA
              </Button>
            ) : (
              <Button onClick={enrollMfa}>Configure MFA</Button>
            )}
          </div>
          {qrCode && !mfaEnrolled && (
            <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
              <h4 className="font-medium">1. Scan the QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Open your authenticator app and scan the image below:
              </p>
              <div
                className="bg-white p-4 w-fit rounded-md mx-auto"
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
              <p className="text-xs text-center text-muted-foreground break-all">
                Secret: {secret}
              </p>
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium">2. Enter the generated code</h4>
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="max-w-[150px] text-center tracking-widest font-mono"
                    maxLength={6}
                  />
                  <Button onClick={verifyMfa} disabled={verifyCode.length < 6}>
                    Verify and Activate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
