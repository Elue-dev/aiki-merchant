'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import AuthTitle from '@/components/auth/auth-title'
import AuthWrapper from '@/components/auth/auth-wrapper'
import FormInput from '@/components/ui/form/form-input'
import { Button } from '@/components/ui/button'
import { useVerifyEmail, useResendVerification, useAuthStore } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pendingEmail = useAuthStore((s) => s.pendingEmail)
  const user = useAuthStore((s) => s.user)
  const { mutateAsync: verifyEmail, isPending } = useVerifyEmail()
  const { mutateAsync: resendVerification, isPending: isResending } = useResendVerification()
  const [resent, setResent] = useState(false)

  const email = searchParams.get('email') ?? pendingEmail ?? user?.email ?? ''

  const form = useForm({
    defaultValues: { otp: '' },
    onSubmit: async ({ value }) => {
      const [_, error] = await safeAsync(() => verifyEmail({ otp: value.otp }))

      if (error) {
        toast.error({
          title: 'Verification failed',
          description: error?.message ?? 'Invalid or expired code. Please try again.',
        })
        return
      }

      toast.success({ title: 'Email verified!', description: 'Your account is now active.' })
      router.push('/')
    },
  })

  const handleResend = async () => {
    if (!email) return
    const [_, error] = await safeAsync(() => resendVerification(email))

    if (error) {
      toast.error({ title: 'Failed to resend', description: error?.message ?? 'Please try again.' })
      return
    }

    setResent(true)
    toast.success({ title: 'Code resent', description: `A new code was sent to ${email}.` })
  }

  return (
    <AuthWrapper>
      <AuthTitle
        title="Verify your email"
        description={
          email
            ? `Enter the 6-digit code sent to ${email}`
            : 'Enter the 6-digit code sent to your email'
        }
      />

      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <FormInput
          form={form}
          name="otp"
          label="Verification Code"
          placeholder="123456"
          validator={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return 'Code is required'
              if (!/^\d{6}$/.test(value)) return 'Enter the 6-digit code'
              return undefined
            },
          }}
          required
        />

        <form.Subscribe selector={(s) => s.values}>
          {(values) => (
            <Button
              type="submit"
              disabled={!values.otp || isPending}
              className="w-full mt-1"
            >
              {isPending ? 'Verifying…' : 'Verify Email'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-sm text-muted-foreground mt-5">
        Didn&apos;t receive a code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || resent}
          className="text-primary font-medium underline disabled:opacity-50 cursor-pointer"
        >
          {isResending ? 'Sending…' : resent ? 'Sent!' : 'Resend code'}
        </button>
      </p>
    </AuthWrapper>
  )
}
