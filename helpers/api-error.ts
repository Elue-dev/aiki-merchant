import type { ApiError } from '@/lib/interceptor'

export function formatApiError(error: ApiError): string {
  const { message } = error
  if (Array.isArray(message)) return message.join('. ')
  return message ?? 'Something went wrong, please try again.'
}
