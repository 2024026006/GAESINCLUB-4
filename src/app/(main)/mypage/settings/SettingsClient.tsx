'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'

interface SettingsClientProps {
  isLeader: boolean
  leaderClubNames: string[]
}

export function SettingsClient({ isLeader, leaderClubNames }: SettingsClientProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDeleteAccount() {
    setLoading(true)
    const { error } = await supabase.rpc('delete_user_account')
    setLoading(false)
    if (error) {
      alert('계정 삭제에 실패했습니다: ' + error.message)
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">비밀번호 변경</h2>
        <PasswordChangeForm />
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-800">계정 탈퇴</h2>
        {isLeader ? (
          <div>
            <p className="text-sm text-red-700">방장 역할을 보유한 동아리가 있어 탈퇴할 수 없습니다.</p>
            <p className="mt-1 text-sm text-red-600">먼저 다음 동아리에서 방장 역할을 이전해주세요:</p>
            <ul className="mt-2 list-disc list-inside text-sm text-red-600">
              {leaderClubNames.map((name) => <li key={name}>{name}</li>)}
            </ul>
          </div>
        ) : (
          <>
            <p className="text-sm text-red-700">탈퇴 시 모든 활동 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            <Button variant="danger" className="mt-4" onClick={() => setShowDeleteDialog(true)}>계정 탈퇴</Button>
          </>
        )}
      </div>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="계정 탈퇴"
        description="정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다."
        confirmLabel="탈퇴"
        confirmVariant="danger"
        onConfirm={handleDeleteAccount}
        loading={loading}
      />
    </div>
  )
}

function PasswordChangeForm() {
  const [supabase] = useState(() => createClient())
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setMessage('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setMessage(error.message)
    else { setMessage('비밀번호가 변경되었습니다.'); setPassword(''); setConfirm('') }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="새 비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      <Input label="비밀번호 확인" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <Button type="submit" loading={loading} className="w-fit">변경</Button>
    </form>
  )
}
