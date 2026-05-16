'use client'

import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/modal'
import { DeviceForm } from '@/components/device-form'
import type { DeviceFormImages } from '@/components/device-form'
import {
  useGetDevices,
  useCreateDevice,
  useUpdateDevice,
  useDeleteDevice,
  useAddDeviceImage,
} from '@/stores/devices'
import type { Device, CreateDevicePayload, UpdateDevicePayload } from '@/stores/devices/types'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'
import { Edit2, Plus, Search, Trash2, Package2, CheckCircle, AlertCircle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  INSTOCK: 'bg-green-400/20 text-green-400',
  SOLD_OUT: 'bg-red-400/20 text-red-400',
  DISCONTINUED: 'bg-muted text-muted-foreground',
}

const STATUS_LABELS: Record<string, string> = {
  INSTOCK: 'In Stock',
  SOLD_OUT: 'Sold Out',
  DISCONTINUED: 'Discontinued',
}

export default function Dashboard() {
  const { data: devices = [], isLoading } = useGetDevices({silent: true})
  const { mutateAsync: createDevice } = useCreateDevice()
  const { mutateAsync: updateDevice } = useUpdateDevice()
  const { mutateAsync: deleteDevice } = useDeleteDevice()
  const { mutateAsync: addDeviceImage } = useAddDeviceImage()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    return devices?.filter((d) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        (d.serialNumber ?? '').toLowerCase().includes(q)
      const matchesStatus = !filterStatus || d.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [devices, searchTerm, filterStatus])

  const totalInStock = devices?.filter((d) => d.status === 'INSTOCK').reduce((s, d) => s + d.quantity, 0)
  const outOfStock = devices?.filter((d) => d.status === 'SOLD_OUT').length

  const handleSubmit = async (payload: CreateDevicePayload | UpdateDevicePayload, images: DeviceFormImages[]) => {
    if (selectedDevice) {
      const [_, error] = await safeAsync(() =>
        updateDevice({ id: selectedDevice.id, payload: payload as UpdateDevicePayload }),
      )
      if (error) {
        toast.error({ title: 'Update failed', description: (error as any)?.message })
        return
      }
      // Upload any newly added images on edit
      if (images.length) {
        await Promise.allSettled(
          images.map((img) => addDeviceImage({ id: selectedDevice.id, payload: img })),
        )
      }
      toast.success({ title: 'Device updated' })
    } else {
      const [res, error] = await safeAsync(() => createDevice(payload as CreateDevicePayload))
      if (error || !res) {
        toast.error({ title: 'Failed to add device', description: (error as any)?.message })
        return
      }
      // Upload images after device is created
      if (images.length) {
        const deviceId = (res as any).data?.id ?? (res as any).id
        if (deviceId) {
          await Promise.allSettled(
            images.map((img) => addDeviceImage({ id: deviceId, payload: img })),
          )
        }
      }
      toast.success({ title: 'Device added' })
    }
    setIsModalOpen(false)
    setSelectedDevice(undefined)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this device?')) return
    const [_, error] = await safeAsync(() => deleteDevice(id))
    if (error) {
      toast.error({ title: 'Delete failed', description: (error as any)?.message })
    } else {
      toast.success({ title: 'Device deleted' })
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-muted-foreground mt-2">Manage your device inventory</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Devices', value: devices.length, icon: Package2, color: 'text-primary' },
            { label: 'Items In Stock', value: totalInStock, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Out of Stock', value: outOfStock, icon: AlertCircle, color: 'text-red-400' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-6 border-border bg-card hover:border-muted transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-10 w-16 mt-2" />
                    ) : (
                      <p className="text-4xl font-bold mt-2">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Filters + Add */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3 flex-1 mr-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-md border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Statuses</option>
              <option value="INSTOCK">In Stock</option>
              <option value="SOLD_OUT">Sold Out</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
          <Button onClick={() => { setSelectedDevice(undefined); setIsModalOpen(true) }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Device
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-6 py-4"><Skeleton className="w-12 h-12 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                      No devices found
                    </td>
                  </tr>
                ) : (
                  filtered.map((device) => {
                    const thumb = device.images?.[0]?.url
                    return (
                      <tr key={device.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          {thumb ? (
                            <img src={thumb} alt={device.name} className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{device.name}</td>
                        <td className="px-6 py-4 text-sm">{device.model}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{device.category}</td>
                        <td className="px-6 py-4 text-sm">
                          {(device.priceKobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                        </td>
                        <td className="px-6 py-4 font-medium">{device.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[device.status] ?? ''}`}>
                            {STATUS_LABELS[device.status] ?? device.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedDevice(device); setIsModalOpen(true) }}
                              className="p-2 hover:bg-muted rounded transition-colors"
                              title="Edit device"
                            >
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(device.id)}
                              className="p-2 hover:bg-red-400/10 rounded transition-colors"
                              title="Delete device"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedDevice(undefined) }}
        title={selectedDevice ? 'Edit Device' : 'Add New Device'}
      >
        <DeviceForm
          device={selectedDevice}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setSelectedDevice(undefined) }}
        />
      </Modal>
    </DashboardLayout>
  )
}
