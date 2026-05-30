'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function NewNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // clubId를 params에서 가져오기 위해 URL에서 추출
    const clubId = window.location.pathname.split('/')[2]
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('notices')
      .insert({ club_id: clubId, author_id: user!.id, title, content, is_pinned: isPinned })
      .select('id')
      .single()

    setLoading(false)
    if (error) { setError(error.message); return }
    router.push(`/clubs/${clubId}/notices/${data.id}`)
    router.refresh()
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">공지사항 작성</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cbnu-red focus:outline-none resize-y"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            <span className="text-sm">상단 고정</span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>취소</Button>
            <Button type="submit" loading={loading}>등록</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
