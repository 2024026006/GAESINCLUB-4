'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { COLLEGES } from '@/constants/colleges'
import type { EnrollStatus } from '@/types'

const STATUS_OPTIONS: EnrollStatus[] = ['재학', '휴학', '졸업']

export default function SignupCompletePage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<EnrollStatus>('재학')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const departments = college ? COLLEGES[college] ?? [] : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^\d{10}$/.test(studentId)) {
      setError('학번은 10자리 숫자여야 합니다.')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
      setLoading(false)
      return
    }
    const { error } = await supabase.from('users').insert({
      id: user.id,
      name,
      student_id: studentId,
      college,
      department,
      phone,
      status,
    })
    setLoading(false)
    if (error) {
      if (error.code === '23505') setError('이미 사용 중인 학번입니다.')
      else setError(error.message)
      return
    }
    router.push('/clubs')
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">프로필 입력</h2>
      <p className="mb-6 text-sm text-gray-500">가입 완료를 위해 추가 정보를 입력해주세요.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="학번 (10자리)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          maxLength={10}
          pattern="\d{10}"
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">단과대학</label>
          <select
            value={college}
            onChange={(e) => { setCollege(e.target.value); setDepartment('') }}
            required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">선택</option>
            {Object.keys(COLLEGES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">학과</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            disabled={!college}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
          >
            <option value="">선택</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <Input label="연락처" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="010-0000-0000" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">재학 상태</label>
          <div className="flex gap-3">
            {STATUS_OPTIONS.map((s) => (
              <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
                <span className="text-sm">{s}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          가입 완료
        </Button>
      </form>
    </div>
  )
}
