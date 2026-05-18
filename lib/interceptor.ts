import axios from 'axios'
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/stores/auth'
import { toast } from './toast'

let isRefreshing = false
let failedQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
]

function isAuthEndpoint(url: string) {
  return AUTH_ENDPOINTS.some((e) => url.includes(e))
}

export function requestInterceptor(
  request: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  if (!request.url) return request

  const { accessToken, pendingToken } = useAuthStore.getState()
  const token = accessToken ?? pendingToken
  if (token && !isAuthEndpoint(request.url)) {
    request.headers['Authorization'] = `Bearer ${token}`
  }

  if (request.method?.toLowerCase() === 'get') {
    request.headers['ngrok-skip-browser-warning'] = 'true'
  }

  return request
}

export function requestErrorInterceptor(error: AxiosError) {
  return Promise.reject(error)
}

export function responseSuccessInterceptor({ data }: AxiosResponse) {
  return data
}

export async function responseErrorInterceptor(
  error: AxiosError<ApiErrorBody>,
) {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean
  }

  if (error.response?.status === 401 && !originalRequest._retry) {
    const url = originalRequest.url ?? ''

    if (isAuthEndpoint(url)) {
      return Promise.reject(buildApiError(error))
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return axios(originalRequest).then(({ data }) => data)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    return new Promise(async (resolve, reject) => {
      try {
        const storedRefreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true },
        )

        const newToken: string =
          data?.data?.access_token ?? data?.data?.accessToken
        const newRefreshToken: string | undefined =
          data?.data?.refresh_token ?? data?.data?.refreshToken
        useAuthStore.getState().setAccessToken(newToken)
        if (newRefreshToken) {
          useAuthStore.getState().setTokens(newToken, newRefreshToken)
        }
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        processQueue(null, newToken)
        resolve(axios(originalRequest).then(({ data }) => data))
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().logout()
        toast.error({
          title: 'Session Expired',
          description: 'Please login again',
        })
        reject(err)
      } finally {
        isRefreshing = false
      }
    })
  }

  return Promise.reject(buildApiError(error))
}

type ApiErrorBody = {
  message?: string | string[]
  error?: string | { code?: string; message?: string | string[] }
  detail?: unknown
}

export type ApiError = {
  message: string | string[]
  fieldErrors?: Record<string, unknown>
  detail?: string
}

function extractMessage(
  msg: string | string[] | undefined,
  fallback?: string,
): string | string[] {
  if (!msg) return fallback ?? 'Something went wrong. Please try again.'
  return msg
}

function buildApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const responseData = error.response?.data
  if (!responseData) return { message: error.message }

  const { message, error: errorField, detail } = responseData

  const nestedMsg =
    errorField && typeof errorField === 'object'
      ? (errorField as { message?: string | string[] }).message
      : (errorField as string | undefined)

  const msg = extractMessage(message ?? nestedMsg)

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    return { message: msg, fieldErrors: detail as Record<string, unknown> }
  }

  if (typeof detail === 'string') {
    return { message: msg, detail }
  }

  return { message: msg }
}
