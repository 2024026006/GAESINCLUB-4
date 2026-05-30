import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from './CalendarClient'
import type { Role } from '@/types'

export default async function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: events }, { data: membership }] = await Promise.all([
    supabase.from('events').select('*, votes:event_votes(user_id, vote)').eq('club_id', clubId).order('start_at'),
    supabase.from('club_members').select('role').eq('club_id', clubId).eq('user_id', user!.id).single(),
  ])

  const role = membership?.role as Role | undefined
  const canManage = role === '방장' || role === '임원'

  return (
    <CalendarClient
      events={events ?? []}
      clubId={clubId}
      userId={user!.id}
      canManage={canManage}
    />
  )
}
