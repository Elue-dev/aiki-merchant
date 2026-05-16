'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import type { Device, CreateDevicePayload, UpdateDevicePayload } from '@/stores/devices/types'
import FormInput from '@/components/ui/form/form-input'
import FormSelect from '@/components/ui/form/form-select'
import { Button } from '@/components/ui/button'
import { validators } from '@/helpers/validators'
import { X, ImagePlus } from 'lucide-react'

export interface DeviceFormImages {
  url: string
  altText?: string
}

interface DeviceFormProps {
  device?: Device
  onSubmit: (payload: CreateDevicePayload | UpdateDevicePayload, images: DeviceFormImages[]) => void
  onCancel: () => void
}

const CATEGORY_OPTIONS = [
  { value: 'COMPUTING', label: 'Computing' },
  { value: 'ENERGY', label: 'Energy' },
  { value: 'CONNECTIVITY', label: 'Connectivity' },
  { value: 'OTHER', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'INSTOCK', label: 'In Stock' },
  { value: 'SOLD_OUT', label: 'Sold Out' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function DeviceForm({ device, onSubmit, onCancel }: DeviceFormProps) {
  const [images, setImages] = useState<DeviceFormImages[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      name: device?.name ?? '',
      model: device?.model ?? '',
      serialNumber: device?.serialNumber ?? '',
      description: device?.description ?? '',
      category: device?.category ?? '',
      priceKobo: device ? device.priceKobo / 100 : 0,
      quantity: device?.quantity ?? 0,
      status: device?.status ?? 'INSTOCK',
      isFeatured: device?.isFeatured ? 'true' : 'false',
    },
    onSubmit: ({ value }) => {
      const payload: CreateDevicePayload = {
        name: value.name,
        model: value.model,
        serialNumber: value.serialNumber || undefined,
        description: value.description,
        category: value.category,
        priceKobo: Math.round(Number(value.priceKobo) * 100),
        quantity: Number(value.quantity),
        status: value.status as CreateDevicePayload['status'],
        isFeatured: value.isFeatured === 'true',
      }
      const newImages = device
        ? images.filter((img) => !device.images?.some((di) => di.url === img.url))
        : images
      onSubmit(payload, newImages)
    },
  })

  useEffect(() => {
    setImages(
      device?.images?.map((img) => ({ url: img.url, altText: img.altText ?? undefined })) ?? [],
    )
  }, [device])

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const converted = await Promise.all(
      files.map(async (f) => ({ url: await fileToDataUrl(f), altText: f.name })),
    )
    setImages((prev) => [...prev, ...converted])
    e.target.value = ''
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-1"
    >
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          form={form}
          name="name"
          label="Name"
          placeholder="e.g., iPhone 15 Pro"
          validator={validators.required('Name')}
          required
        />
        <FormInput
          form={form}
          name="model"
          label="Model"
          placeholder="e.g., A3089"
          validator={validators.required('Model')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          form={form}
          name="category"
          label="Category"
          placeholder="Select category…"
          options={CATEGORY_OPTIONS}
          validator={validators.required('Category')}
          required
        />
        <FormInput
          form={form}
          name="serialNumber"
          label="Serial Number"
          placeholder="e.g., SN001234"
          validator={{}}
        />
      </div>

      <FormInput
        form={form}
        name="description"
        label="Description"
        placeholder="Short device description…"
        validator={validators.required('Description')}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          form={form}
          name="priceKobo"
          label="Price (₦)"
          type="number"
          placeholder="0"
          validator={validators.required('Price')}
          required
        />
        <FormInput
          form={form}
          name="quantity"
          label="Quantity"
          type="number"
          placeholder="0"
          validator={validators.required('Quantity')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          form={form}
          name="status"
          label="Status"
          placeholder="Select status…"
          options={STATUS_OPTIONS}
          validator={{}}
        />
        <FormSelect
          form={form}
          name="isFeatured"
          label="Featured"
          placeholder="Select…"
          options={[
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes' },
          ]}
          validator={{}}
        />
      </div>

      {/* Images */}
      <div className="pb-2">
        <label className="block text-[14px] text-foreground mb-1.5">Images</label>
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-md overflow-hidden border border-border group"
            >
              <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-md border border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-1 hover:bg-muted/60 transition-colors text-muted-foreground"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px]">Add</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilePick}
          className="hidden"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
        <Button type="submit">{device ? 'Update Device' : 'Add Device'}</Button>
      </div>
    </form>
  )
}
