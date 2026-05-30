import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, created_at, author:users(name), comment_count:comments(count)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">게시판</h2>
        <Link href={`/clubs/${clubId}/board/new`} className="rounded-lg bg-cbnu-red px-3 py-1.5 text-sm font-medium text-white hover:bg-cbnu-red-hover">
          + 글쓰기
        </Link>
      </div>

      {(!posts || posts.length === 0) && (
        <p className="py-12 text-center text-gray-500">등록된 게시글이 없습니다.</p>
      )}

      <div className="flex flex-col gap-2">
        {posts?.map((post) => (
          <Link key={post.id} href={`/clubs/${clubId}/board/${post.id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors">
            <span className="flex-1 truncate text-gray-900">{post.title}</span>
            <span className="text-xs text-gray-400 shrink-0">{(post.author as any)?.name}</span>
            <span className="text-xs text-gray-400 shrink-0">{formatDate(post.created_at)}</span>
            <span className="text-xs text-gray-400 shrink-0">💬 {(post.comment_count as any)?.[0]?.count ?? 0}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
