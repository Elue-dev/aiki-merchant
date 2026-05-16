'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import AuthTitle from '@/components/auth/auth-title'
import AuthWrapper from '@/components/auth/auth-wrapper'
import FormInput from '@/components/ui/form/form-input'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import { useForgotPassword } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword()

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      const [_, error] = await safeAsync(() => forgotPassword({ email: value.email }))

      if (error) {
        toast.error({
          title: 'Request failed',
          description: error?.message ?? 'Something went wrong, please try again.',
        })
        return
      }

      setSent(true)
    },
  })

  if (sent) {
    return (
      <AuthWrapper>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="text-primary" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Check your inbox</h1>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a password reset link to your email. Follow the instructions to reset your password.
          </p>
          <Link href="/auth/login" className="mt-6 block text-sm text-primary font-medium underline">
            Back to login
          </Link>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <AuthTitle
        title="Forgot password?"
        description="Enter your email and we'll send you a reset link"
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
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          validator={validators.email}
          leftIcon={<Mail size={16} />}
          required
        />

        <form.Subscribe selector={(s) => s.values}>
          {(values) => (
            <Button
              type="submit"
              disabled={!values.email || isPending}
              className="w-full mt-1"
            >
              {isPending ? 'Sending…' : 'Send Reset Link'}
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
