import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTeam,
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
} from './api'
import type { InviteTeamMemberPayload, UpdateTeamMemberRolePayload } from './types'
import { withSlowRequestTracking } from '@/helpers/track-slow-requests'

export const TEAM_KEYS = {
  all: ['team'] as const,
}

export function useGetTeam(options?: { silent?: boolean }) {
  return useQuery({
    queryKey: TEAM_KEYS.all,
    queryFn: () => withSlowRequestTracking(() => getTeam(), options),
    select: (res) => res.data,
  })
}

export function useInviteTeamMember(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InviteTeamMemberPayload) =>
      withSlowRequestTracking(() => inviteTeamMember(payload), options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all })
    },
  })
}

export function useUpdateTeamMemberRole(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeamMemberRolePayload }) =>
      withSlowRequestTracking(() => updateTeamMemberRole(id, payload), options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all })
    },
  })
}

export function useRemoveTeamMember(options?: { silent?: boolean }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => withSlowRequestTracking(() => removeTeamMember(id), options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all })
    },
  })
}
