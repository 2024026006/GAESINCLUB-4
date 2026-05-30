'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

export function PostActions({ postId, clubId, isAuthor }: { postId: string; clubId: string; isAuthor: boolean }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await supabase.from('posts').delete().eq('id', postId)
    setLoading(false)
    setOpen(false)
    router.push(`/clubs/${clubId}/board`)
    router.refresh()
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>삭제</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까?" confirmLabel="삭제" confirmVariant="danger"
        onConfirm={handleDelete} loading={loading} />
    </>
  )
}

export function CommentForm({ postId, clubId, userId }: { postId: string; clubId: string; userId: string }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await supabase.from('comments').insert({ post_id: postId, author_id: userId, content })
    setLoading(false)
    setContent('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 입력하세요..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
      <Button type="submit" loading={loading} disabled={!content.trim()}>등록</Button>
    </form>
  )
}

export function CommentDeleteButton({ commentId, clubId, postId }: { commentId: string; clubId: string; postId: string }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  async function handleDelete() {
    await supabase.from('comments').delete().eq('id', commentId)
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700">삭제</button>
  )
}
