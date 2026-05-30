'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/mypage/settings`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200 text-center">
        <p className="text-sm text-gray-600"><strong>{email}</strong>로 재설정 링크를 발송했습니다.</p>
        <Link href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">로그인으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
      <h2 className="mb-6 text-xl font-semibold">비밀번호 재설정</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="가입한 이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">재설정 링크 발송</Button>
      </form>
      <Link href="/login" className="mt-4 block text-center text-sm text-gray-500 hover:text-blue-600">로그인으로 돌아가기</Link>
    </div>
  )
}
