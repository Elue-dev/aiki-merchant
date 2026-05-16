import client from '@/lib/client'
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  VerifyEmailResponse,
  AcceptInvitePayload,
  AcceptInviteResponse,
} from './types'

export const register = (payload: RegisterPayload): Promise<RegisterResponse> =>
  client.post('/auth/register/vendor', payload)

export const login = (payload: LoginPayload): Promise<LoginResponse> =>
  client.post('/auth/login', payload)

export const verifyEmail = (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> =>
  client.post('/auth/verify-email', payload)

export const refreshToken = (): Promise<RefreshResponse> => client.post('/auth/refresh')

export const logout = (): Promise<void> => client.post('/auth/logout')

export const getMe = (): Promise<MeResponse> => client.get('/auth/me')

export const forgotPassword = (payload: ForgotPasswordPayload): Promise<void> =>
  client.post('/auth/forgot-password', payload)

export const resetPassword = (payload: ResetPasswordPayload): Promise<void> =>
  client.post('/auth/reset-password', payload)

export const resendVerification = (payload: { email: string }): Promise<void> =>
  client.post('/auth/resend-verification', payload)

export const acceptInvite = (
  token: string,
  payload: AcceptInvitePayload,
): Promise<AcceptInviteResponse> => client.post(`/auth/register/invite/${token}`, payload)
