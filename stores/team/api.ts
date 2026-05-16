import client from '@/lib/client'
import type {
  ApiEnvelope,
  TeamMember,
  TeamInvitation,
  InviteTeamMemberPayload,
  UpdateTeamMemberRolePayload,
} from './types'

export const getTeam = (): Promise<ApiEnvelope<TeamMember[]>> => client.get('/vendor/team')

export const inviteTeamMember = (
  payload: InviteTeamMemberPayload,
): Promise<ApiEnvelope<TeamInvitation>> => client.post('/vendor/team/invite', payload)

export const updateTeamMemberRole = (
  id: string,
  payload: UpdateTeamMemberRolePayload,
): Promise<ApiEnvelope<TeamMember>> => client.put(`/vendor/team/${id}/role`, payload)

export const removeTeamMember = (id: string): Promise<void> =>
  client.del(`/vendor/team/${id}`)
