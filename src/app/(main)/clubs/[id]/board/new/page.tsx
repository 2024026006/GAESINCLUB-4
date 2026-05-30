'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function NewPostPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const clubId = window.location.pathname.split('/')[2]
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('posts')
      .insert({ club_id: clubId, author_id: user!.id, title, content })
      .select('id').single()
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push(`/clubs/${clubId}/board/${data.id}`)
    router.refresh()
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">게시글 작성</h2>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={10}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-y" />
          </div>
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
