export type OrderStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'EQUITY_PAID'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export interface OrderItem {
  id: string
  orderId: string
  deviceId: string
  quantity: number
  unitPriceKobo: number
  totalPriceKobo: number
  deviceName: string
  deviceModel: string
  createdAt: string
}

export interface OrderUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface Order {
  id: string
  reference: string
  userId: string
  vendorId: string
  subtotalKobo: number
  equityContributionKobo: number
  interestRate: number
  totalRepayableKobo: number
  tenure: number
  monthlyPaymentKobo: number
  status: OrderStatus
  deliveryAddress: string
  deliveryConfirmationCode: string | null
  deliveryConfirmedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  escrowAccountId: string | null
  escrowStatus: string | null
  paystackReference: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  user: OrderUser
}

export interface OrdersMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OrdersResponse {
  data: Order[]
  meta: OrdersMeta
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
  note?: string
}
