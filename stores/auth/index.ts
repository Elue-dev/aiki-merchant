import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as authApi from './api'
import type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AcceptInvitePayload,
  AuthState,
} from './types'
import { withSlowRequestTracking } from '@/helpers/track-slow-requests'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      vendor: null,
      isAuthenticated: false,
      pendingEmail: null,
      pendingToken: null,
      pendingRefreshToken: null,
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true })
      },
      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: true })
      },
      setUser: (user) => set({ user }),
      setVendor: (vendor) => set({ vendor }),
      setPendingEmail: (email) => set({ pendingEmail: email }),
      setPendingVerification: (email, token, refreshToken) =>
        set({ pendingEmail: email, pendingToken: token, pendingRefreshToken: refreshToken ?? null }),
      confirmVerified: () =>
        set((s) => ({
          ...(s.pendingToken
            ? { accessToken: s.pendingToken, refreshToken: s.pendingRefreshToken }
            : {}),
          isAuthenticated: true,
          pendingEmail: null,
          pendingToken: null,
          pendingRefreshToken: null,
        })),
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          vendor: null,
          isAuthenticated: false,
          pendingEmail: null,
          pendingToken: null,
          pendingRefreshToken: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        user: s.user,
        vendor: s.vendor,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        pendingEmail: s.pendingEmail,
        pendingToken: s.pendingToken,
        pendingRefreshToken: s.pendingRefreshToken,
      }),
    },
  ),
)

export const AUTH_KEYS = {
  me: ['auth', 'me'] as const,
}

export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const setVendor = useAuthStore((s) => s.setVendor)

  const query = useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: authApi.getMe,
    enabled: useAuthStore.getState().isAuthenticated,
  })

  useEffect(() => {
    if (query.data?.data) {
      setUser(query.data.data.user)
      if (query.data.data.vendor) setVendor(query.data.data.vendor)
    }
  }, [query.data, setUser, setVendor])

  return query
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const setVendor = useAuthStore((s) => s.setVendor)

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      withSlowRequestTracking(() => authApi.login(payload)),
    onSuccess: async (res) => {
      setTokens(res.data.accessToken, res.data.refreshToken)
      const me = await authApi.getMe()
      setVendor(me.data.vendor)
      setUser(res.data.user)
    },
    onError: () => {},
  })
}

export function useRegister() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const setVendor = useAuthStore((s) => s.setVendor)
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail)

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      withSlowRequestTracking(() => authApi.register(payload)),
    onSuccess: (res) => {
      setTokens(res.data.accessToken, res.data.refreshToken)
      setUser(res.data.user)
      setVendor(res.data.vendor)
      setPendingEmail(res.data.user.email)
    },
  })
}

export function useVerifyEmail() {
  const confirmVerified = useAuthStore((s) => s.confirmVerified)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) =>
      withSlowRequestTracking(() => authApi.verifyEmail(payload)),
    onSuccess: (res) => {
      confirmVerified()
      if (res?.data?.user) setUser(res.data.user)
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me })
      queryClient.refetchQueries({ queryKey: AUTH_KEYS.me })
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => withSlowRequestTracking(() => authApi.logout()),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
    onError: () => {
      logout()
      queryClient.clear()
    },
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      withSlowRequestTracking(() => authApi.resendVerification({ email })),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      withSlowRequestTracking(() => authApi.forgotPassword(payload)),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      withSlowRequestTracking(() => authApi.resetPassword(payload)),
  })
}

export function useAcceptInvite() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const setVendor = useAuthStore((s) => s.setVendor)

  return useMutation({
    mutationFn: ({ token, payload }: { token: string; payload: AcceptInvitePayload }) =>
      withSlowRequestTracking(() => authApi.acceptInvite(token, payload)),
    onSuccess: (res) => {
      setTokens(res.data.accessToken, res.data.refreshToken)
      setUser(res.data.user)
      setVendor(res.data.vendor)
    },
  })
}
