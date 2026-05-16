import client from '@/lib/client'
import type {
  ApiEnvelope,
  PaginatedEnvelope,
  Device,
  DeviceImage,
  CreateDevicePayload,
  UpdateDevicePayload,
  AddDeviceImagePayload,
} from './types'

export const getDevices = (): Promise<PaginatedEnvelope<Device>> =>
  client.get('/vendor/devices')

export const getDevice = (id: string): Promise<ApiEnvelope<Device>> =>
  client.get(`/vendor/devices/${id}`)

export const createDevice = (payload: CreateDevicePayload): Promise<ApiEnvelope<Device>> =>
  client.post('/vendor/devices', payload)

export const updateDevice = (
  id: string,
  payload: UpdateDevicePayload,
): Promise<ApiEnvelope<Device>> => client.put(`/vendor/devices/${id}`, payload)

export const deleteDevice = (id: string): Promise<void> =>
  client.del(`/vendor/devices/${id}`)

export const addDeviceImage = (
  id: string,
  payload: AddDeviceImagePayload,
): Promise<ApiEnvelope<DeviceImage>> => client.post(`/vendor/devices/${id}/images`, payload)

export const deleteDeviceImage = (id: string, imageId: string): Promise<void> =>
  client.del(`/vendor/devices/${id}/images/${imageId}`)
