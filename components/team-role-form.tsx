'use client'

import { useForm } from '@tanstack/react-form'
import FormSelect from '@/components/ui/form/form-select'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import type { VendorRole } from '@/stores/team/types'

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'VENDOR_ADMIN' },
  { label: 'Editor', value: 'VENDOR_EDITOR' },
  { label: 'Viewer', value: 'VENDOR_VIEWER' },
]

interface TeamRoleFormProps {
  currentRole: VendorRole
  onSubmit: (role: VendorRole) => Promise<void>
  onCancel: () => void
  isPending?: boolean
}

export function TeamRoleForm({ currentRole, onSubmit, onCancel, isPending }: TeamRoleFormProps) {
  const form = useForm({
    defaultValues: { role: currentRole },
    onSubmit: async ({ value }) => {
      await onSubmit(value.role as VendorRole)
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
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
