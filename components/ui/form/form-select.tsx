import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Option {
  label: string
  value: string
}

interface FormSelectProps {
  form: any
  name: string
  label?: string
  description?: string
  placeholder?: string
  validator: any
  options: Option[]
  className?: string
  disabled?: boolean
  required?: boolean
}

export default function FormSelect({
  form,
  name,
  label,
  description,
  placeholder,
  validator = {},
  options,
  className = '',
  disabled = false,
  required = false,
}: FormSelectProps) {
  return (
    <form.Field name={name} validators={validator}>
      {(field: any) => (
        <div className={cn('mb-4', className)}>
          {label && (
            <label className="block text-[14px] text-foreground mb-1.5">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
          )}
          <Select
            value={field.state.value}
            onValueChange={field.handleChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                'w-full px-3.5 py-2.5 h-11! rounded-xl border border-border bg-input text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all',
                field.state.meta.errors.length > 0 && 'border-destructive',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <SelectValue
                placeholder={
                  <span className="text-muted-foreground">{placeholder}</span>
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {description && (
            <p className="text-[12px] text-muted-foreground ml-2 mt-1">{description}</p>
          )}

          {field.state.meta.errors.length > 0 && (
            <span className="text-destructive text-xs mt-1 block">
              {field.state.meta.errors[0]}
            </span>
          )}
        </div>
      )}
    </form.Field>
  )
}
