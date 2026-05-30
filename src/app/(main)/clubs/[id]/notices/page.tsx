import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Role } from '@/types'

export default async function NoticesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: notices }, { data: membership }] = await Promise.all([
    supabase
      .from('notices')
      .select('id, title, is_pinned, created_at, author:users(name)')
      .eq('club_id', clubId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('club_members').select('role').eq('club_id', clubId).eq('user_id', user!.id).single(),
  ])

  const role = membership?.role as Role | undefined
  const canWrite = role === '방장' || role === '임원'
  const pinned = (notices ?? []).filter((n) => n.is_pinned)
  const regular = (notices ?? []).filter((n) => !n.is_pinned)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">공지사항</h2>
        {canWrite && (
          <Link href={`/clubs/${clubId}/notices/new`} className="rounded-lg bg-cbnu-red px-3 py-1.5 text-sm font-medium text-white hover:bg-cbnu-red-hover">
            + 작성
          </Link>
        )}
      </div>

      {pinned.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {pinned.map((n) => (
            <Link key={n.id} href={`/clubs/${clubId}/notices/${n.id}`}
              className="flex items-center gap-3 rounded-xl border border-cbnu-red/30 bg-cbnu-red-surface px-4 py-3 hover:bg-cbnu-red/10 transition-colors">
              <span className="text-xs font-semibold text-cbnu-red shrink-0">📌 고정</span>
              <span className="flex-1 truncate font-medium text-gray-900">{n.title}</span>
              <span className="text-xs text-gray-500 shrink-0">{formatDate(n.created_at)}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {regular.length === 0 && pinned.length === 0 && (
          <p className="py-12 text-center text-gray-500">등록된 공지사항이 없습니다.</p>
        )}
        {regular.map((n) => (
          <Link key={n.id} href={`/clubs/${clubId}/notices/${n.id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors">
            <span className="flex-1 truncate text-gray-900">{n.title}</span>
            <span className="text-xs text-gray-400 shrink-0">{(n.author as any)?.name}</span>
            <span className="text-xs text-gray-400 shrink-0">{formatDate(n.created_at)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
