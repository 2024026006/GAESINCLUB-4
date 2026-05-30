import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: leaderClubs } = await supabase
    .from('club_members')
    .select('club:clubs(name)')
    .eq('user_id', user!.id)
    .eq('role', '방장')

  return <SettingsClient isLeader={(leaderClubs?.length ?? 0) > 0} leaderClubNames={(leaderClubs ?? []).map((m: any) => m.club?.name ?? '')} />
}
