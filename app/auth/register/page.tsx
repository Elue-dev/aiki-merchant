'use client'

import { useState, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, Building2, MapPin } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import AuthTitle from '@/components/auth/auth-title'
import AuthWrapper from '@/components/auth/auth-wrapper'
import FormInput from '@/components/ui/form/form-input'
import PasswordRules, { isPasswordValid } from '@/components/auth/password-rules'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import { useRegister } from '@/stores/auth'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'
import { formatApiError } from '@/helpers/api-error'
import type { ApiError } from '@/lib/interceptor'

const STEPS = ['Personal Info', 'Business Info']

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

export default function RegisterPage() {
  const router = useRouter()
  const { mutateAsync: register, isPending } = useRegister()
  const [step, setStep] = useState(0)
  const direction = useRef(1)

  const goTo = (next: number) => {
    direction.current = next > step ? 1 : -1
    setStep(next)
  }

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      vendorName: '',
      vendorDescription: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
    },
    onSubmit: async ({ value }) => {
      const [_, error] = await safeAsync(() =>
        register({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          phone: value.phone || undefined,
          password: value.password,
          vendorName: value.vendorName,
          vendorDescription: value.vendorDescription || undefined,
          contactEmail: value.contactEmail || undefined,
          contactPhone: value.contactPhone || undefined,
          address: value.address || undefined,
        }),
      )

      if (error) {
        toast.error({
          title: 'Registration failed',
          description: formatApiError(error as ApiError),
        })
        return
      }

      router.push('/auth/verify-email')
    },
  })

  const handleNext = async () => {
    const fields =
      step === 0
        ? (['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'] as const)
        : (['vendorName', 'vendorDescription', 'contactEmail', 'contactPhone', 'address'] as const)

    await Promise.all(fields.map((f) => form.validateField(f, 'change')))

    const hasErrors = fields.some(
      (f) => (form.getFieldMeta(f)?.errors?.length ?? 0) > 0,
    )

    const values = form.state.values
    const step0Required =
      values.firstName && values.lastName && values.email && values.password && values.confirmPassword

    if (step === 0 && !step0Required) return
    if (!hasErrors) goTo(1)
  }

  return (
    <AuthWrapper>
      <div className="w-full flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1.5">
            <div
              className={`h-1 rounded-full transition-all ${
                i <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                i === step ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction.current}>
        <motion.div
          key={step === 0 ? 'title-0' : 'title-1'}
          custom={direction.current}
          variants={SLIDE_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-full"
        >
          <AuthTitle
            title={step === 0 ? 'Personal Info' : 'Business Info'}
            description={
              step === 0
                ? 'Tell us a bit about yourself'
                : 'Set up your vendor profile'
            }
          />
        </motion.div>
      </AnimatePresence>

      <form
        className="w-full overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <AnimatePresence mode="wait" custom={direction.current}>
          {step === 0 ? (
            <motion.div
              key="step-0"
              custom={direction.current}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
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
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                validator={validators.email}
                leftIcon={<Mail size={16} />}
                required
              />
              <FormInput
                form={form}
                name="phone"
                label="Phone"
                type="tel"
                placeholder="+234 800 000 0000"
                validator={validators.phone}
                leftIcon={<Phone size={16} />}
              />
              <FormInput
                form={form}
                name="password"
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                validator={validators.password}
                leftIcon={<Lock size={16} />}
                required
              />

              <form.Subscribe selector={(s) => ({ password: s.values.password, confirmPassword: s.values.confirmPassword })}>
                {({ password, confirmPassword }) => (
                  <>
                    <PasswordRules password={password} confirmPassword={confirmPassword} />
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

              <form.Subscribe selector={(s) => s.values}>
                {(values) => (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      !values.firstName ||
                      !values.lastName ||
                      !values.email ||
                      !isPasswordValid(values.password) ||
                      values.password !== values.confirmPassword
                    }
                    className="w-full mt-1"
                  >
                    Continue
                  </Button>
                )}
              </form.Subscribe>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              custom={direction.current}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <FormInput
                form={form}
                name="vendorName"
                label="Business Name"
                placeholder="Acme Devices"
                validator={validators.required('Business name')}
                leftIcon={<Building2 size={16} />}
                required
              />
              <FormInput
                form={form}
                name="vendorDescription"
                label="Business Description"
                placeholder="What does your business do?"
                validator={{}}
              />
              <FormInput
                form={form}
                name="contactEmail"
                label="Contact Email"
                type="email"
                placeholder="contact@yourbusiness.com"
                validator={{}}
                leftIcon={<Mail size={16} />}
              />
              <FormInput
                form={form}
                name="contactPhone"
                label="Contact Phone"
                type="tel"
                placeholder="+234 800 000 0000"
                validator={validators.phone}
                leftIcon={<Phone size={16} />}
              />
              <FormInput
                form={form}
                name="address"
                label="Address"
                placeholder="123 Main St, Lagos"
                validator={{}}
                leftIcon={<MapPin size={16} />}
              />

              <div className="flex gap-3 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goTo(0)}
                  className="flex-1"
                >
                  Back
                </Button>
                <form.Subscribe selector={(s) => s.values}>
                  {(values) => (
                    <Button
                      type="submit"
                      disabled={!values.vendorName || isPending}
                      className="flex-1"
                    >
                      {isPending ? 'Creating…' : 'Create Account'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {step === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mt-4"
        >
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium underline">
            Log in
          </Link>
        </motion.p>
      )}
    </AuthWrapper>
  )
}
