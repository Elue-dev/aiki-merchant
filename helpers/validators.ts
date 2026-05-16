type FieldValue = { value: string }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validators = {
  email: {
    onChange: ({ value }: FieldValue) => {
      if (!value) return 'Email is required'
      if (!emailRegex.test(value)) return 'Invalid email address'
      return undefined
    },
  },
  password: {
    onChange: ({ value }: FieldValue) => {
      if (!value) return 'Password is required'
      if (value.length < 8) return 'Password must be at least 8 characters'
      return undefined
    },
  },
  confirmPassword: (getPassword: () => string) => ({
    onChange: ({ value }: FieldValue) => {
      if (!value) return 'Please confirm your password'
      if (value !== getPassword()) return 'Passwords do not match'
      return undefined
    },
  }),
  required: (label = 'This field') => ({
    onChange: ({ value }: FieldValue) => {
      if (!value?.trim()) return `${label} is required`
      return undefined
    },
  }),
  phone: {
    onChange: ({ value }: FieldValue) => {
      if (!value) return undefined
      if (!/^\+?[\d\s\-()]{7,15}$/.test(value)) return 'Invalid phone number'
      return undefined
    },
  },
}
