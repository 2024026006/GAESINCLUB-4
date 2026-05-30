'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { EnrollStatus, User } from '@/types'

const STATUS_OPTIONS: EnrollStatus[] = ['재학', '휴학', '졸업']

export function ProfileForm({ profile }: { profile: User }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [phone, setPhone] = useState(profile.phone)
  const [status, setStatus] = useState<EnrollStatus>(profile.status)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('users').update({ phone, status }).eq('id', profile.id)
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">이름</span>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">{profile.name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">학번</span>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">{profile.student_id}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">단과대학</span>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">{profile.college}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">학과</span>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">{profile.department}</span>
        </div>
      </div>

      <Input label="연락처" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">재학 상태</label>
        <div className="flex gap-4">
          {STATUS_OPTIONS.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>저장</Button>
        {success && <span className="text-sm text-green-600">저장되었습니다.</span>}
      </div>
    </form>
  )
}
