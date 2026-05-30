'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

export function DeleteNoticeButton({ noticeId, clubId }: { noticeId: string; clubId: string }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await supabase.from('notices').delete().eq('id', noticeId)
    setLoading(false)
    setOpen(false)
    router.push(`/clubs/${clubId}/notices`)
    router.refresh()
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>삭제</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="공지사항 삭제"
        description="이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}

export function PinToggleButton({ noticeId, clubId, isPinned }: { noticeId: string; clubId: string; isPinned: boolean }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await supabase.from('notices').update({ is_pinned: !isPinned }).eq('id', noticeId)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleToggle} loading={loading}>
      {isPinned ? '고정 해제' : '상단 고정'}
    </Button>
  )
}
