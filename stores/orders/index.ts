import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as ordersApi from './api'
import type { GetOrdersParams } from './api'
import type { UpdateOrderStatusPayload } from './types'

export const ORDERS_KEYS = {
  all: ['orders'] as const,
  list: (params: GetOrdersParams) => ['orders', 'list', params] as const,
}

export function useOrders(params: GetOrdersParams = {}) {
  return useQuery({
    queryKey: ORDERS_KEYS.list(params),
    queryFn: () => ordersApi.getOrders(params),
    placeholderData: (prev) => prev,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderStatusPayload }) =>
      ordersApi.updateOrderStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all })
    },
  })
}
