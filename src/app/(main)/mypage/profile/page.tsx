import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './ProfileForm'
import type { User } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user!.id).single()

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold">개인 프로필</h2>
      <ProfileForm profile={profile as User} />
    </div>
  )
}
