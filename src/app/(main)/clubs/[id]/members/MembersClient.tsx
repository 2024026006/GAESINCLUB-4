'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import type { Role } from '@/types'

const ROLES: Role[] = ['임원', '총무', '일반 회원']

interface MembersClientProps {
  members: any[]
  requests: any[]
  clubId: string
  currentUserId: string
  isLeader: boolean
}

export function MembersClient({ members, requests, clubId, currentUserId, isLeader }: MembersClientProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [transferTarget, setTransferTarget] = useState<string | null>(null)
  const [kickTarget, setKickTarget] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<any | null>(null)
  const [approveRole, setApproveRole] = useState<Role>('일반 회원')
  const [loading, setLoading] = useState(false)

  async function handleRoleChange(userId: string, newRole: Role) {
    await supabase.from('club_members').update({ role: newRole }).eq('club_id', clubId).eq('user_id', userId)
    router.refresh()
  }

  async function handleKick() {
    if (!kickTarget) return
    setLoading(true)
    await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', kickTarget)
    setLoading(false)
    setKickTarget(null)
    router.refresh()
  }

  async function handleTransfer() {
    if (!transferTarget) return
    setLoading(true)
    const { error } = await supabase.rpc('transfer_leadership', { p_club_id: clubId, p_new_leader_id: transferTarget })
    setLoading(false)
    setTransferTarget(null)
    if (!error) router.refresh()
    else alert('방장 이전에 실패했습니다.')
  }

  async function handleApprove() {
    if (!approveTarget) return
    setLoading(true)
    await supabase.from('join_requests').update({ status: '승인', processed_at: new Date().toISOString() }).eq('id', approveTarget.id)
    await supabase.from('club_members').insert({ club_id: clubId, user_id: approveTarget.user_id, role: approveRole })
    setLoading(false)
    setApproveTarget(null)
    router.refresh()
  }

  async function handleReject(requestId: string) {
    await supabase.from('join_requests').update({ status: '거절', processed_at: new Date().toISOString() }).eq('id', requestId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {requests.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
          <div className="border-b border-orange-200 px-4 py-3">
            <h3 className="font-semibold text-orange-800">가입 신청 대기 ({requests.length})</h3>
          </div>
          <div className="divide-y divide-orange-100">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={req.user?.name ?? '?'} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{req.user?.name}</p>
                  <p className="text-xs text-gray-500">{req.user?.department} · {req.user?.student_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setApproveTarget(req)} className="rounded-lg bg-cbnu-red px-3 py-1.5 text-xs font-medium text-white hover:bg-cbnu-red-hover">승인</button>
                  <button onClick={() => handleReject(req.id)} className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300">거절</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="font-semibold text-gray-900">부원 목록 ({members.length}명)</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.user?.name ?? '?'} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{m.user?.name}</span>
                  <RoleBadge role={m.role} />
                </div>
                <p className="text-xs text-gray-500">{m.user?.department} · {m.user?.student_id}</p>
              </div>
              {isLeader && m.user_id !== currentUserId && m.role !== '방장' && (
                <div className="flex items-center gap-2">
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.user_id, e.target.value as Role)}
                    className="rounded border border-gray-300 text-xs px-2 py-1"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => setTransferTarget(m.user_id)} className="text-xs text-purple-600 hover:text-purple-800">방장 이전</button>
                  <button onClick={() => setKickTarget(m.user_id)} className="text-xs text-red-500 hover:text-red-700">퇴출</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!kickTarget} onClose={() => setKickTarget(null)} title="부원 강제 퇴출"
        description="선택한 부원을 동아리에서 퇴출하시겠습니까?" confirmLabel="퇴출" confirmVariant="danger"
        onConfirm={handleKick} loading={loading} />

      <Dialog open={!!transferTarget} onClose={() => setTransferTarget(null)} title="방장 역할 이전"
        description="선택한 부원에게 방장 역할을 이전하시겠습니까? 회원님은 일반 회원으로 변경됩니다."
        confirmLabel="이전" onConfirm={handleTransfer} loading={loading} />

      <Dialog open={!!approveTarget} onClose={() => setApproveTarget(null)} title="가입 신청 승인"
        confirmLabel="승인" onConfirm={handleApprove} loading={loading}>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600"><strong>{approveTarget?.user?.name}</strong>님의 가입을 승인합니다.</p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">역할 부여</label>
            <select value={approveRole} onChange={(e) => setApproveRole(e.target.value as Role)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
