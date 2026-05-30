import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { PostActions, CommentForm, CommentDeleteButton } from './PostActions'
import type { Role } from '@/types'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>
}) {
  const { id: clubId, postId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: post }, { data: comments }, { data: membership }] = await Promise.all([
    supabase.from('posts').select('*, author:users(name)').eq('id', postId).single(),
    supabase.from('comments').select('*, author:users(name)').eq('post_id', postId).order('created_at'),
    supabase.from('club_members').select('role').eq('club_id', clubId).eq('user_id', user!.id).single(),
  ])

  if (!post) notFound()

  const role = membership?.role as Role | undefined
  const isLeader = role === '방장'
  const isAuthor = post.author_id === user!.id

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/clubs/${clubId}/board`} className="text-sm text-gray-500 hover:text-gray-700">← 목록</Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
          {(isAuthor || isLeader) && (
            <PostActions postId={postId} clubId={clubId} isAuthor={isAuthor} />
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
          <Avatar name={(post.author as any)?.name ?? '?'} size="sm" />
          <span>{(post.author as any)?.name}</span>
          <span>·</span>
          <span>{formatDateTime(post.created_at)}</span>
        </div>
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">댓글 {comments?.length ?? 0}개</h2>
        <div className="flex flex-col gap-4">
          {comments?.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={(c.author as any)?.name ?? '?'} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{(c.author as any)?.name}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                  {(c.author_id === user!.id || isLeader) && (
                    <CommentDeleteButton commentId={c.id} clubId={clubId} postId={postId} />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-700">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <CommentForm postId={postId} clubId={clubId} userId={user!.id} />
        </div>
      </div>
    </div>
  )
}
