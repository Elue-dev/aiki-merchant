'use client'

import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import AuthTitle from '@/components/auth/auth-title'
import AuthWrapper from '@/components/auth/auth-wrapper'
import FormInput from '@/components/ui/form/form-input'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import { useResetPassword } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { mutateAsync: resetPassword, isPending } = useResetPassword()

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error({ title: 'Invalid link', description: 'Reset token is missing.' })
        return
      }

      const [_, error] = await safeAsync(() =>
        resetPassword({ token, newPassword: value.password }),
      )

      if (error) {
        toast.error({
          title: 'Reset failed',
          description: error?.message ?? 'Something went wrong, please try again.',
        })
        return
      }

      toast.success({ title: 'Password updated', description: 'You can now log in with your new password.' })
      router.push('/auth/login')
    },
  })

  return (
    <AuthWrapper>
      <AuthTitle
        title="Reset your password"
        description="Enter a new password for your account"
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
          name="password"
          label="New Password"
          type="password"
          placeholder="Min. 8 characters"
          validator={validators.password}
          leftIcon={<Lock size={16} />}
          required
        />
        <FormInput
          form={form}
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter your password"
          validator={validators.confirmPassword(() => form.getFieldValue('password'))}
          leftIcon={<Lock size={16} />}
          required
        />

        <form.Subscribe selector={(s) => s.values}>
          {(values) => (
            <Button
              type="submit"
              disabled={!values.password || !values.confirmPassword || isPending}
              className="w-full mt-1"
            >
              {isPending ? 'Resetting…' : 'Reset Password'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <Link href="/auth/login" className="text-[14px] text-muted-foreground underline mt-5">
        Back to login
      </Link>
    </AuthWrapper>
  )
}
