'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'


const AUTH_ONLY_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

const PUBLIC_AUTH_ROUTES = ['/auth/verify-email', '/register/vendor-invite']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const pendingEmail = useAuthStore((s) => s.pendingEmail)

  useEffect(() => {
    const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((r) => pathname.startsWith(r))
    const isAuthRoute = isAuthOnlyRoute || isPublicAuthRoute


    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/auth/login')
      return
    }

    if (isAuthenticated && isAuthOnlyRoute) {
      if (pendingEmail) {
        router.replace('/auth/verify-email')
        return
      }
      router.replace('/')
    }
  }, [isAuthenticated, pathname, pendingEmail, router])

  return <>{children}</>
}
