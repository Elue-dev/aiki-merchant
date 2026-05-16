'use client'

import { Suspense } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, User, Phone, Mail } from 'lucide-react'
import AuthTitle from '@/components/auth/auth-title'
import AuthWrapper from '@/components/auth/auth-wrapper'
import FormInput from '@/components/ui/form/form-input'
import PasswordRules, { isPasswordValid } from '@/components/auth/password-rules'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import { useAcceptInvite } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'
import { formatApiError } from '@/helpers/api-error'

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const { mutateAsync: acceptInvite, isPending } = useAcceptInvite()

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      const [_, error] = await safeAsync(() =>
        acceptInvite({
          token,
          payload: {
            firstName: value.firstName,
            lastName: value.lastName,
            password: value.password,
          },
        }),
      )

      if (error) {
        toast.error({ title: 'Failed to accept invite', description: formatApiError(error) })
        return
      }

      toast.success({ title: 'Welcome!', description: 'Your account has been set up.' })
      router.push('/')
    },
  })

  return (
    <AuthWrapper>
      <AuthTitle
        title="You've been invited"
        description="Set up your account to join the team"
      />

      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="mb-4">
          <label className="block text-[14px] text-foreground mb-1.5">Email Address</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full pl-10 px-3.5 py-2.5 h-11 rounded-xl border border-border bg-input text-sm text-foreground opacity-50 cursor-not-allowed outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            form={form}
            name="firstName"
            label="First Name"
            placeholder="John"
            validator={validators.required('First name')}
            leftIcon={<User size={16} />}
            required
          />
          <FormInput
            form={form}
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            validator={validators.required('Last name')}
            leftIcon={<User size={16} />}
            required
          />
        </div>

        <FormInput
          form={form}
          name="phone"
          label="Phone Number"
          type="tel"
          placeholder="08012345678"
          validator={validators.phone}
          leftIcon={<Phone size={16} />}
        />

        <FormInput
          form={form}
          name="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          validator={validators.password}
          leftIcon={<Lock size={16} />}
          required
        />

        <form.Subscribe selector={(s) => s.values.password}>
          {(password) => (
            <>
              <PasswordRules
                password={password}
                confirmPassword={form.getFieldValue('confirmPassword')}
              />
              <FormInput
                form={form}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                validator={validators.confirmPassword(() => form.getFieldValue('password'))}
                leftIcon={<Lock size={16} />}
                required
              />
            </>
          )}
        </form.Subscribe>

        <form.Subscribe
          selector={(s) => ({
            values: s.values,
            isValid:
              isPasswordValid(s.values.password) &&
              s.values.password === s.values.confirmPassword,
          })}
        >
          {({ values, isValid }) => (
            <Button
              type="submit"
              disabled={!values.firstName || !values.lastName || !isValid || isPending}
              className="w-full mt-1"
            >
              {isPending ? 'Setting up account…' : 'Accept Invite'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthWrapper>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  )
}
