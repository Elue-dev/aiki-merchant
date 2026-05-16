'use client'

import { useForm } from '@tanstack/react-form'
import FormInput from '@/components/ui/form/form-input'
import FormSelect from '@/components/ui/form/form-select'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import type { InviteTeamMemberPayload } from '@/stores/team/types'

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'VENDOR_ADMIN' },
  { label: 'Editor', value: 'VENDOR_EDITOR' },
  { label: 'Viewer', value: 'VENDOR_VIEWER' },
]

interface TeamInviteFormProps {
  onSubmit: (payload: InviteTeamMemberPayload) => Promise<void>
  onCancel: () => void
  isPending?: boolean
}

export function TeamInviteForm({ onSubmit, onCancel, isPending }: TeamInviteFormProps) {
  const form = useForm({
    defaultValues: {
      email: '',
      role: '' as InviteTeamMemberPayload['role'],
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        email: value.email,
        role: value.role,
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-1"
    >
      <FormInput
        form={form}
        name="email"
        label="Email Address"
        type="email"
        placeholder="e.g., john@company.com"
        validator={validators.email}
        required
      />
      <FormSelect
        form={form}
        name="role"
        label="Role"
        placeholder="Select a role…"
        options={ROLE_OPTIONS}
        validator={validators.required('Role')}
        required
      />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Sending invite…' : 'Send Invite'}
        </Button>
      </div>
    </form>
  )
}
