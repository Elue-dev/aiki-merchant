import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addDeviceImage,
  createDevice,
  deleteDevice,
  deleteDeviceImage,
  getDevice,
  getDevices,
  updateDevice,
} from './api'
import type { AddDeviceImagePayload, CreateDevicePayload, UpdateDevicePayload } from './types'
import { withSlowRequestTracking } from '@/helpers/track-slow-requests'

export const DEVICE_KEYS = {
  all: ['devices'] as const,
  detail: (id: string) => ['devices', id] as const,
}

export function useGetDevices(options?: { silent?: boolean }) {
  return useQuery({
    queryKey: DEVICE_KEYS.all,
    queryFn: () => withSlowRequestTracking(() => getDevices(), options),
    select: (res) => res.data,
  })
}

export function useGetDevice(id: string, options?: { silent?: boolean }) {
  return useQuery({
    queryKey: DEVICE_KEYS.detail(id),
    queryFn: () => withSlowRequestTracking(() => getDevice(id), options),
    select: (res) => res.data,
    enabled: !!id,
  })
}

export function useCreateDevice(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDevicePayload) =>
      withSlowRequestTracking(() => createDevice(payload), options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.all })
    },
  })
}

export function useUpdateDevice(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDevicePayload }) =>
      withSlowRequestTracking(() => updateDevice(id, payload), options),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.detail(id) })
    },
  })
}

export function useDeleteDevice(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => withSlowRequestTracking(() => deleteDevice(id), options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.all })
    },
  })
}

export function useAddDeviceImage(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddDeviceImagePayload }) =>
      withSlowRequestTracking(() => addDeviceImage(id, payload), options),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.all })
    },
  })
}

export function useDeleteDeviceImage(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
      withSlowRequestTracking(() => deleteDeviceImage(id, imageId), options),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.all })
    },
  })
}
