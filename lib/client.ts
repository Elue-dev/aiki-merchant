import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseSuccessInterceptor,
  responseErrorInterceptor,
} from './interceptor'

const apiClient = axios.create({
baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
apiClient.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor)

type RequestData = Record<string, unknown> | object

const get = <T = unknown>(url: string, params?: AxiosRequestConfig['params']): Promise<T> =>
  apiClient.get(url, params ? { params } : {})

const post = <T = unknown>(url: string, data?: RequestData): Promise<T> =>
  apiClient.post(url, data)

const patch = <T = unknown>(url: string, data?: RequestData): Promise<T> =>
  apiClient.patch(url, data)

const put = <T = unknown>(url: string, data?: RequestData): Promise<T> =>
  apiClient.put(url, data)

const del = <T = unknown>(url: string): Promise<T> => apiClient.delete(url)

export default { get, post, patch, put, del }
