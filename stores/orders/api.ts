import client from '@/lib/client'
import type { OrdersResponse, Order, UpdateOrderStatusPayload } from './types'

export interface GetOrdersParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

export const getOrders = (params?: GetOrdersParams): Promise<OrdersResponse> =>
  client.get('/vendor/orders', params)

export const updateOrderStatus = (
  id: string,
  payload: UpdateOrderStatusPayload,
): Promise<{ data: Order }> => client.put(`/vendor/orders/${id}/status`, payload)
