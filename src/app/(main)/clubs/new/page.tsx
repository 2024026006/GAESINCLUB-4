'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OFFICIAL_CLUB_NAMES } from '@/constants/clubs'
import type { Category, RecruitStatus } from '@/types'

const CATEGORIES: Category[] = ['교양', '학술', '문화', '봉사', '체육', '종교']

export default function NewClubPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('교양')
  const [recruitStatus, setRecruitStatus] = useState<RecruitStatus>('모집 중')
  const [intro, setIntro] = useState('')
  const [foundedYear, setFoundedYear] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isOfficialName = OFFICIAL_CLUB_NAMES.includes(name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!isOfficialName) {
      setError('부록 B에 등재된 공식 동아리 이름만 개설 가능합니다.')
      return
    }
    const year = parseInt(foundedYear)
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      setError('유효한 창설 연도를 입력해주세요.')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setError('로그인이 필요합니다.')
    const { data, error } = await supabase
      .from('clubs')
      .insert({ name, category, recruit_status: recruitStatus, intro, founded_year: year, created_by: user.id })
      .select('id')
      .single()
    setLoading(false)
    if (error) {
      if (error.code === '23505') setError('이미 개설된 동아리입니다.')
      else setError(error.message)
      return
    }
    router.push(`/clubs/${data.id}`)
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">동아리 개설</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">동아리 이름</label>
            <input
              list="official-clubs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="공식 동아리 이름 선택"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cbnu-red focus:outline-none"
            />
            <datalist id="official-clubs">
              {OFFICIAL_CLUB_NAMES.map((n) => <option key={n} value={n} />)}
            </datalist>
            {name && !isOfficialName && (
              <p className="text-xs text-red-600">공식 동아리 목록에 없는 이름입니다.</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">분과</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">모집 상태</label>
            <div className="flex gap-4">
              {(['모집 중', '모집 마감'] as RecruitStatus[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recruit" value={s} checked={recruitStatus === s} onChange={() => setRecruitStatus(s)} />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">한 줄 소개 <span className="text-gray-400">({intro.length}/100)</span></label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={100}
              rows={2}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-cbnu-red focus:outline-none resize-none"
            />
          </div>

          <Input
            label="창설 연도"
            type="number"
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
            min={1900}
            max={new Date().getFullYear()}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">동아리 개설</Button>
        </form>
      </div>
    </div>
  )
}
