export type VendorRole = 'VENDOR_ADMIN' | 'VENDOR_EDITOR' | 'VENDOR_VIEWER'

export interface TeamMemberUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: VendorRole
}

export interface TeamMember {
  id: string
  userId: string
  vendorId: string
  user: TeamMemberUser
}

export interface TeamInvitation {
  id: string
  email: string
  role: VendorRole
  vendorId: string
  token: string
  expiresAt: string
}

export interface InviteTeamMemberPayload {
  email: string
  role: VendorRole
}

export interface UpdateTeamMemberRolePayload {
  role: VendorRole
}

export interface ApiEnvelope<T> {
  data: T
}
