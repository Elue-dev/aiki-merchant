'use client'

import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/modal'
import { TeamInviteForm } from '@/components/team-invite-form'
import { TeamRoleForm } from '@/components/team-role-form'
import {
  useGetTeam,
  useInviteTeamMember,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
} from '@/stores/team'
import type { TeamMember, InviteTeamMemberPayload, VendorRole } from '@/stores/team/types'
import { toast } from '@/lib/toast'
import { safeAsync } from '@/helpers/safe-sync'
import { Edit2, Plus, Search, Trash2, Shield, PenTool, Eye } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  VENDOR_ADMIN: 'Admin',
  VENDOR_EDITOR: 'Editor',
  VENDOR_VIEWER: 'Viewer',
}

const ROLE_COLORS: Record<string, string> = {
  VENDOR_ADMIN: 'bg-purple-400/20 text-purple-400',
  VENDOR_EDITOR: 'bg-blue-400/20 text-blue-400',
  VENDOR_VIEWER: 'bg-gray-400/20 text-gray-400',
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  VENDOR_ADMIN: <Shield className="w-3.5 h-3.5" />,
  VENDOR_EDITOR: <PenTool className="w-3.5 h-3.5" />,
  VENDOR_VIEWER: <Eye className="w-3.5 h-3.5" />,
}

type ModalMode = 'invite' | 'edit-role' | null

export default function TeamPage() {
  const { data: team = [], isLoading } = useGetTeam({silent: true})
  const { mutateAsync: invite, isPending: isInviting } = useInviteTeamMember()
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateTeamMemberRole()
  const { mutateAsync: removeMember } = useRemoveTeamMember()

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const filtered = useMemo(() => {
    return team.filter((m) => {
      const q = searchTerm.toLowerCase()
      const fullName = `${m.user.firstName} ${m.user.lastName}`.toLowerCase()
      const matchesSearch = !q || fullName.includes(q) || m.user.email.toLowerCase().includes(q)
      const matchesRole = !filterRole || m.user.role === filterRole
      return matchesSearch && matchesRole
    })
  }, [team, searchTerm, filterRole])

  const closeModal = () => {
    setModalMode(null)
    setSelectedMember(undefined)
  }

  const handleInvite = async (payload: InviteTeamMemberPayload) => {
    const [_, error] = await safeAsync(() => invite(payload))
    if (error) {
      toast.error({ title: 'Invite failed', description: (error as any)?.message })
      return
    }
    toast.success({ title: 'Invite sent', description: `An invitation was sent to ${payload.email}` })
    closeModal()
  }

  const handleUpdateRole = async (role: VendorRole) => {
    if (!selectedMember) return
    const [_, error] = await safeAsync(() =>
      updateRole({ id: selectedMember.id, payload: { role } }),
    )
    if (error) {
      toast.error({ title: 'Update failed', description: (error as any)?.message })
      return
    }
    toast.success({ title: 'Role updated' })
    closeModal()
  }

  const handleRemove = async (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.user.firstName} ${member.user.lastName} from the team?`)) return
    const [_, error] = await safeAsync(() => removeMember(member.id))
    if (error) {
      toast.error({ title: 'Remove failed', description: (error as any)?.message })
    } else {
      toast.success({ title: 'Team member removed' })
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Team</h1>
            <p className="text-muted-foreground mt-2">Manage your team members and their permissions</p>
          </div>
          <Button onClick={() => setModalMode('invite')} className="gap-2">
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search team members…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 rounded-md border border-border bg-input text-foreground text-sm"
          >
            <option value="">All Roles</option>
            <option value="VENDOR_ADMIN">Admin</option>
            <option value="VENDOR_EDITOR">Editor</option>
            <option value="VENDOR_VIEWER">Viewer</option>
          </select>
        </div>

        {/* Team Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 border-border bg-card">
                <Skeleton className="h-5 w-36 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 border-border bg-card text-center">
            <p className="text-muted-foreground">
              {team.length === 0
                ? 'No team members yet. Invite someone to get started.'
                : 'No team members match your search.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member) => {
              const role = member.user.role
              return (
                <Card key={member.id} className="p-6 border-border bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {member.user.firstName} {member.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => { setSelectedMember(member); setModalMode('edit-role') }}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit role"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleRemove(member)}
                        className="p-2 hover:bg-red-400/10 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {ROLE_ICONS[role]}
                    {ROLE_LABELS[role] ?? role}
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={modalMode === 'invite'} onClose={closeModal} title="Invite Team Member">
        <TeamInviteForm onSubmit={handleInvite} onCancel={closeModal} isPending={isInviting} />
      </Modal>

      <Modal isOpen={modalMode === 'edit-role'} onClose={closeModal} title="Change Role">
        {selectedMember && (
          <TeamRoleForm
            currentRole={selectedMember.user.role}
            onSubmit={handleUpdateRole}
            onCancel={closeModal}
            isPending={isUpdating}
          />
        )}
      </Modal>
    </DashboardLayout>
  )
}
