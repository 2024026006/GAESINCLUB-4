'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import type { Category, RecruitStatus } from '@/types'

const CATEGORIES: Category[] = ['교양', '학술', '문화', '봉사', '체육', '종교']

export default function ClubSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const clubId = params.id as string
  const [supabase] = useState(() => createClient())
  const [club, setClub] = useState<any>(null)
  const [intro, setIntro] = useState('')
  const [recruitStatus, setRecruitStatus] = useState<RecruitStatus>('모집 중')
  const [showDelete, setShowDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase.from('clubs').select('*').eq('id', clubId).single().then(({ data }) => {
      if (data) { setClub(data); setIntro(data.intro); setRecruitStatus(data.recruit_status) }
    })
  }, [clubId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('clubs').update({ intro, recruit_status: recruitStatus }).eq('id', clubId)
    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('clubs').delete().eq('id', clubId)
    setDeleting(false)
    router.push('/clubs')
    router.refresh()
  }

  if (!club) return null

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">동아리 설정</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">동아리명 (변경 불가)</span>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">{club.name}</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">모집 상태</label>
            <div className="flex gap-4">
              {(['모집 중', '모집 마감'] as RecruitStatus[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={s} checked={recruitStatus === s} onChange={() => setRecruitStatus(s)} />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">한 줄 소개 <span className="text-gray-400">({intro.length}/100)</span></label>
            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={100} rows={2}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cbnu-red focus:outline-none resize-none" />
          </div>

          <Button type="submit" loading={saving}>저장</Button>
        </form>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-800">동아리 삭제</h2>
        <p className="text-sm text-red-700 mb-4">동아리를 삭제하면 게시판, 공지, 채팅, 회비 등 모든 데이터가 영구 삭제됩니다.</p>
        <Button variant="danger" onClick={() => setShowDelete(true)}>동아리 삭제</Button>
      </div>

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="동아리 삭제"
        description={`'${club.name}' 동아리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제" confirmVariant="danger" onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
