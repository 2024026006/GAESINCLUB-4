import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RoleBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { MembersClient } from './MembersClient'
import type { Role } from '@/types'

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: members }, { data: membership }, { data: requests }] = await Promise.all([
    supabase.from('club_members').select('*, user:users(*)').eq('club_id', clubId).order('joined_at'),
    supabase.from('club_members').select('role').eq('club_id', clubId).eq('user_id', user!.id).single(),
    supabase.from('join_requests').select('*, user:users(*)').eq('club_id', clubId).eq('status', '대기').order('requested_at'),
  ])

  const role = membership?.role as Role | undefined
  const isLeader = role === '방장'

  return (
    <MembersClient
      members={members ?? []}
      requests={isLeader ? (requests ?? []) : []}
      clubId={clubId}
      currentUserId={user!.id}
      isLeader={isLeader}
    />
  )
}
