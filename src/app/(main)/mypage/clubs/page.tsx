import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RoleBadge, CategoryBadge } from '@/components/ui/Badge'
import type { Category, Role } from '@/types'

export default async function MyclubsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('club_members')
    .select('role, club:clubs(id, name, category, recruit_status, intro)')
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false })

  return (
    <div className="flex flex-col gap-4">
      {(!memberships || memberships.length === 0) && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">가입된 동아리가 없습니다.</p>
          <Link href="/clubs" className="mt-3 inline-block text-sm text-blue-600 hover:underline">동아리 탐색하기</Link>
        </div>
      )}
      {memberships?.map((m) => {
        const club = m.club as any
        return (
          <Link key={club.id} href={`/clubs/${club.id}`}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 hover:border-blue-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{club.name}</span>
                <RoleBadge role={m.role as Role} />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <CategoryBadge category={club.category as Category} />
                <span className="text-xs text-gray-500">{club.intro}</span>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        )
      })}
    </div>
  )
}
