import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { DeleteNoticeButton, PinToggleButton } from './NoticeActions'
import type { Role } from '@/types'

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string; noticeId: string }>
}) {
  const { id: clubId, noticeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: notice }, { data: membership }] = await Promise.all([
    supabase
      .from('notices')
      .select('*, author:users(name)')
      .eq('id', noticeId)
      .eq('club_id', clubId)
      .single(),
    supabase.from('club_members').select('role').eq('club_id', clubId).eq('user_id', user!.id).single(),
  ])

  if (!notice) notFound()

  const role = membership?.role as Role | undefined
  const canManage = role === '방장' || role === '임원'

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <Link href={`/clubs/${clubId}/notices`} className="text-sm text-gray-500 hover:text-gray-700">← 목록</Link>
        {canManage && (
          <div className="flex items-center gap-2">
            <PinToggleButton noticeId={noticeId} clubId={clubId} isPinned={notice.is_pinned} />
            <DeleteNoticeButton noticeId={noticeId} clubId={clubId} />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {notice.is_pinned && (
          <span className="mb-2 inline-block text-xs font-semibold text-cbnu-red">📌 고정 공지</span>
        )}
        <h1 className="text-xl font-bold text-gray-900">{notice.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span>{(notice.author as any)?.name}</span>
          <span>·</span>
          <span>{formatDateTime(notice.created_at)}</span>
        </div>
        <div className="mt-6 whitespace-pre-wrap text-gray-800 leading-relaxed">{notice.content}</div>
        {notice.images?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {notice.images.map((url: string, i: number) => (
              <img key={i} src={url} alt="" className="h-40 w-auto rounded-lg object-cover border border-gray-200" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
