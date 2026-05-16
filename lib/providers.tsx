'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sileo'
import { VendorProvider } from '@/lib/vendor-context'
import { useLoaderStore } from '@/stores/loader'
import AppLoader from '@/components/app-loader'

function AppShell({ children }: { children: React.ReactNode }) {
  const showLoader = useLoaderStore((s) => s.showLoader)
  return (
    <>
      {children}
      {showLoader && <AppLoader />}
    </>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <VendorProvider>
        <AppShell>
          {children}
        </AppShell>
      </VendorProvider>
      <Toaster theme="light" position="top-center" />
    </QueryClientProvider>
  )
}
