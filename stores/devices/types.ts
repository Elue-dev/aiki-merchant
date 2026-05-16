export interface DeviceImage {
  id: string
  deviceId: string
  url: string
  altText: string | null
  sortOrder: number
}

export interface Device {
  id: string
  vendorId: string
  name: string
  model: string
  serialNumber: string | null
  description: string
  category: string
  priceKobo: number
  quantity: number
  status: 'INSTOCK' | 'SOLD_OUT' | 'DISCONTINUED'
  isFeatured: boolean
  images: DeviceImage[]
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginatedEnvelope<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiEnvelope<T> {
  data: T
}

export interface CreateDevicePayload {
  name: string
  model: string
  serialNumber?: string
  description: string
  category: string
  priceKobo: number
  quantity: number
  status?: 'INSTOCK' | 'SOLD_OUT' | 'DISCONTINUED'
  isFeatured?: boolean
}

export interface UpdateDevicePayload {
  name?: string
  model?: string
  serialNumber?: string
  description?: string
  category?: string
  priceKobo?: number
  quantity?: number
  status?: 'INSTOCK' | 'SOLD_OUT' | 'DISCONTINUED'
  isFeatured?: boolean
}

export interface AddDeviceImagePayload {
  url: string
  altText?: string
}
