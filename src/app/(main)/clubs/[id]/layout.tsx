import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClubNav } from './ClubNav'
import type { Category, RecruitStatus, Role } from '@/types'
import { CategoryBadge, RecruitBadge, RoleBadge } from '@/components/ui/Badge'

export default async function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: club }, { data: membership }] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', id).single(),
    supabase.from('club_members').select('role').eq('club_id', id).eq('user_id', user.id).single(),
  ])

  if (!club) redirect('/clubs')

  const role = membership?.role as Role | undefined
  const isMember = !!role

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CategoryBadge category={club.category as Category} />
              <RecruitBadge status={club.recruit_status as RecruitStatus} />
              {role && <RoleBadge role={role} />}
              <span className="text-xs text-gray-400">{club.founded_year}년 창설</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">{club.intro || '소개가 없습니다.'}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {!isMember && <JoinButton clubId={id} userId={user.id} />}
            {role === '방장' && (
              <a href={`/clubs/${id}/settings`} className="text-xs text-gray-500 hover:text-gray-700">설정</a>
            )}
          </div>
        </div>
      </div>

      <ClubNav clubId={id} isMember={isMember} role={role} />

      <div className="mt-4">
        {isMember ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500">부원만 접근할 수 있습니다.</p>
            <p className="mt-1 text-sm text-gray-400">가입 신청 후 방장의 승인을 받으세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}

async function JoinButton({ clubId, userId }: { clubId: string; userId: string }) {
  const supabase = await createClient()
  const { data: req } = await supabase
    .from('join_requests')
    .select('status')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .single()

  if (req?.status === '대기') {
    return <span className="text-sm text-gray-500">신청 대기 중</span>
  }
  if (req?.status === '승인') return null

  return (
    <form action={`/api/clubs/${clubId}/join`} method="POST">
      <button
        type="submit"
        className="rounded-lg bg-cbnu-red px-4 py-2 text-sm font-medium text-white hover:bg-cbnu-red-hover"
      >
        가입 신청
      </button>
    </form>
  )
}
