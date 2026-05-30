'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export function GalleryClient({ items, clubId, userId }: { items: any[]; clubId: string; userId: string }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) { alert('파일 크기는 10MB 이하여야 합니다.'); return }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${clubId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file)
    if (uploadError) { alert(uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)
    await supabase.from('gallery_items').insert({
      club_id: clubId, uploader_id: userId, url: publicUrl, file_type: file.type, caption: file.name,
    })
    setUploading(false)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">갤러리</h2>
        <label className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          {uploading ? '업로드 중...' : '+ 업로드'}
          <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {items.length === 0 && <p className="py-12 text-center text-gray-500">업로드된 파일이 없습니다.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
            {item.file_type?.startsWith('image/') ? (
              <button onClick={() => setLightbox(item.url)} className="block w-full">
                <img src={item.url} alt={item.caption ?? ''} className="h-40 w-full object-cover group-hover:opacity-90 transition-opacity" />
              </button>
            ) : (
              <a href={item.url} target="_blank" className="flex h-40 items-center justify-center bg-gray-50 text-4xl">📄</a>
            )}
            <div className="p-2">
              <p className="truncate text-xs text-gray-600">{item.caption}</p>
              <p className="text-xs text-gray-400">{item.uploader?.name} · {formatDate(item.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
