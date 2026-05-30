'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    router.push('/clubs')
    router.refresh()
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">로그인</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="example@cbnu.ac.kr"
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          로그인
        </Button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600">
        <Link href="/reset-password" className="hover:text-blue-600">
          비밀번호 재설정
        </Link>
        <span>
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            회원가입
          </Link>
        </span>
      </div>
    </div>
  )
}
