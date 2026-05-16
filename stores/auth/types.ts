export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  profilePhotoUrl?: string | null
  emailVerified: boolean
}

export interface Vendor {
  id: string
  name: string
  slug: string
}

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  vendor: Vendor | null
  isAuthenticated: boolean
  pendingEmail: string | null
  pendingToken: string | null
  pendingRefreshToken: string | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setVendor: (vendor: Vendor) => void
  setPendingEmail: (email: string) => void
  setPendingVerification: (email: string, token: string, refreshToken?: string) => void
  confirmVerified: () => void
  logout: () => void
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  vendorName: string
  vendorDescription?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
}

export interface RegisterResponse {
  data: {
    user: User
    vendor: Vendor
    accessToken: string
    refreshToken: string
  }
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export interface VerifyEmailPayload {
  otp: string
}

export interface VerifyEmailResponse {
  data: {
    user: User
    accessToken: string
    refreshToken?: string
  }
}

export interface RefreshResponse {
  data: {
    accessToken: string
  }
}

export interface MeResponse {
  data: {
    user: User
    vendor: Vendor
    kycStatus: string
    personalProfile: unknown | null
    businessClient: unknown | null
    businessEmployee: unknown | null
  }
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface AcceptInvitePayload {
  firstName: string
  lastName: string
  password: string
}

export interface AcceptInviteResponse {
  data: {
    user: User
    vendor: Vendor
    accessToken: string
    refreshToken: string
  }
}
