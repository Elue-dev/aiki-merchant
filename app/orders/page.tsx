'use client'

import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/modal'
import { useOrders, useUpdateOrderStatus } from '@/stores/orders'
import type { Order, OrderStatus } from '@/stores/orders/types'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'
import {
  Search,
  ShoppingCart,
  Clock,
  Zap,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'bg-yellow-400/20 text-yellow-400',
  APPROVED: 'bg-purple-400/20 text-purple-400',
  EQUITY_PAID: 'bg-cyan-400/20 text-cyan-400',
  PROCESSING: 'bg-blue-400/20 text-blue-400',
  DISPATCHED: 'bg-orange-400/20 text-orange-400',
  DELIVERED: 'bg-green-400/20 text-green-400',
  COMPLETED: 'bg-emerald-400/20 text-emerald-400',
  CANCELLED: 'bg-red-400/20 text-red-400',
  REJECTED: 'bg-red-600/20 text-red-500',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  EQUITY_PAID: 'Equity Paid',
  PROCESSING: 'Processing',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
}

const STATUS_ORDER: OrderStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'EQUITY_PAID',
  'PROCESSING',
  'DISPATCHED',
  'DELIVERED',
  'COMPLETED',
]

function getNextStatuses(current: OrderStatus): OrderStatus[] {
  const idx = STATUS_ORDER.indexOf(current)
  if (idx === -1) return [] // terminal (CANCELLED, REJECTED)
  const ahead = STATUS_ORDER.slice(idx + 1)
  // Can jump to any forward state, plus cancel/reject if not already terminal
  const extras: OrderStatus[] = current !== 'DELIVERED' && current !== 'COMPLETED'
    ? ['CANCELLED', 'REJECTED']
    : []
  return [...ahead, ...extras]
}

function koboToNaira(kobo: number) {
  return (kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
}

const columnHelper = createColumnHelper<Order>()

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [statusModal, setStatusModal] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')
  const [note, setNote] = useState('')

  const { data, isLoading, isFetching } = useOrders({
    page,
    pageSize: 20,
    status: filterStatus || undefined,
  })

  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateOrderStatus()

  const orders = data?.data ?? []
  const meta = data?.meta

  const filtered = useMemo(() => {
    if (!search) return orders
    const q = search.toLowerCase()
    return orders.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.user.firstName.toLowerCase().includes(q) ||
        o.user.lastName.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q) ||
        o.items.some((item) => item.deviceName.toLowerCase().includes(q)),
    )
  }, [orders, search])

  const columns = useMemo(
    () => [
      columnHelper.accessor('reference', {
        header: 'Reference',
        cell: (info) => <span className="font-medium text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('user', {
        header: 'Customer',
        cell: (info) => {
          const u = info.getValue()
          return (
            <div>
              <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          )
        },
      }),
      columnHelper.accessor('items', {
        header: 'Device(s)',
        cell: (info) => {
          const items = info.getValue()
          if (!items?.length) return <span className="text-muted-foreground text-xs">—</span>
          return (
            <div>
              <p className="text-sm">{items[0].deviceName}</p>
              <p className="text-xs text-muted-foreground">
                {items[0].deviceModel}{items.length > 1 ? ` +${items.length - 1} more` : ''}
              </p>
            </div>
          )
        },
      }),
      columnHelper.accessor('tenure', {
        header: 'Tenure',
        cell: (info) => <span className="text-sm">{info.getValue()} mo</span>,
      }),
      columnHelper.accessor('monthlyPaymentKobo', {
        header: 'Monthly',
        cell: (info) => <span className="text-sm">{koboToNaira(info.getValue())}</span>,
      }),
      columnHelper.accessor('totalRepayableKobo', {
        header: 'Total',
        cell: (info) => <span className="font-medium text-sm">{koboToNaira(info.getValue())}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue()
          return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s] ?? 'bg-muted text-muted-foreground'}`}>
              {STATUS_LABELS[s] ?? s}
            </span>
          )
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const order = row.original
          const next = getNextStatuses(order.status)
          if (!next.length) return <span className="text-xs text-muted-foreground">—</span>
          return (
            <button
              onClick={() => {
                setStatusModal(order)
                setNewStatus('')
                setNote('')
              }}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update
            </button>
          )
        },
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.totalPages ?? -1,
  })

  const handleStatusUpdate = async () => {
    if (!statusModal || !newStatus) return
    const [_, error] = await safeAsync(() =>
      updateStatus({ id: statusModal.id, payload: { status: newStatus as OrderStatus, note: note || undefined } }),
    )
    if (error) {
      toast.error({ title: 'Update failed', description: (error as any)?.message ?? 'Please try again.' })
      return
    }
    toast.success({ title: 'Status updated', description: `Order ${statusModal.reference} is now ${STATUS_LABELS[newStatus] ?? newStatus}` })
    setStatusModal(null)
  }

  const handleExportCsv = () => {
    const rows = filtered.map((o) => ({
      Reference: o.reference,
      Customer: `${o.user.firstName} ${o.user.lastName}`,
      Email: o.user.email,
      Device: o.items.map((i) => `${i.deviceName} (${i.deviceModel})`).join('; '),
      Tenure: `${o.tenure} months`,
      'Monthly Payment (NGN)': (o.monthlyPaymentKobo / 100).toFixed(2),
      'Total Repayable (NGN)': (o.totalRepayableKobo / 100).toFixed(2),
      Status: STATUS_LABELS[o.status] ?? o.status,
      Date: new Date(o.createdAt).toLocaleDateString(),
    }))

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const totalOrders = meta?.total ?? 0
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_APPROVAL').length
  const processingOrders = orders.filter((o) => o.status === 'PROCESSING').length
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage and track customer orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-primary' },
            { label: 'Pending', value: pendingOrders, icon: Clock, color: 'text-yellow-400' },
            { label: 'Processing', value: processingOrders, icon: Zap, color: 'text-blue-400' },
            { label: 'Delivered', value: deliveredOrders, icon: CheckCircle, color: 'text-green-400' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-4 border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-12 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, customer, device…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="px-4 py-2 rounded-md border border-border bg-input text-foreground text-sm min-w-40"
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {table.getHeaderGroups()[0].headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3.5">
                        <Skeleton className="h-4 w-28 mb-1.5" />
                        <Skeleton className="h-3 w-36" />
                      </td>
                      <td className="px-4 py-3.5">
                        <Skeleton className="h-4 w-24 mb-1.5" />
                        <Skeleton className="h-3 w-16" />
                      </td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-14" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className={`hover:bg-muted/20 transition-colors ${isFetching ? 'opacity-60' : ''}`}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total} total
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages || isFetching}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status">
        {statusModal && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order</p>
              <p className="font-medium">{statusModal.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current status</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[statusModal.status]}`}>
                {STATUS_LABELS[statusModal.status] ?? statusModal.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New status <span className="text-red-500">*</span></label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground text-sm"
              >
                <option value="">Select status…</option>
                {getNextStatuses(statusModal.status).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status change…"
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setStatusModal(null)}>Cancel</Button>
              <Button onClick={handleStatusUpdate} disabled={!newStatus || isUpdating}>
                {isUpdating ? 'Updating…' : 'Update Status'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
