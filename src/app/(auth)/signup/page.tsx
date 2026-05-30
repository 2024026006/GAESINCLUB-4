'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [supabase] = useState(() => createClient())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup/complete` },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200 text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h2 className="text-lg font-semibold text-gray-900">이메일을 확인해주세요</h2>
        <p className="mt-2 text-sm text-gray-600">
          <strong>{email}</strong>로 인증 메일을 발송했습니다.
          <br />
          메일의 링크를 클릭하면 프로필 입력 단계로 이동합니다.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">회원가입</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@cbnu.ac.kr"
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="8자 이상"
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          이메일 인증 발송
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-club-blue hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
