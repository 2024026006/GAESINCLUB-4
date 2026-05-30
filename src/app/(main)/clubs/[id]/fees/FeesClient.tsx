'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Fee, MemberFeeStatusRecord, FeeType, MemberFeeStatus } from '@/types'

interface FeesClientProps {
  fees: any[]
  feeStatuses: any[]
  canManage: boolean
  clubId: string
  userId: string
}

export function FeesClient({ fees, feeStatuses, canManage, clubId, userId }: FeesClientProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState<FeeType>('입금')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAddFee() {
    const amt = parseInt(amount)
    if (!desc || isNaN(amt) || amt <= 0) return
    setLoading(true)
    await supabase.from('fees').insert({ club_id: clubId, author_id: userId, type, amount: amt, description: desc })
    setLoading(false)
    setShowAdd(false)
    setAmount(''); setDesc('')
    router.refresh()
  }

  async function toggleFeeStatus(memberId: string, currentStatus: MemberFeeStatus) {
    const newStatus: MemberFeeStatus = currentStatus === '납부 완료' ? '미납' : '납부 완료'
    await supabase.from('member_fee_status')
      .upsert({ club_id: clubId, user_id: memberId, status: newStatus }, { onConflict: 'club_id,user_id' })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 부원별 납부 현황 */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="font-semibold text-gray-900">부원별 납부 현황</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {feeStatuses.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-900">{s.user?.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${s.status === '납부 완료' ? 'text-green-600' : 'text-red-600'}`}>
                  {s.status}
                </span>
                {canManage && (
                  <button
                    onClick={() => toggleFeeStatus(s.user_id, s.status)}
                    className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                  >
                    변경
                  </button>
                )}
              </div>
            </div>
          ))}
          {feeStatuses.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-500">부원이 없습니다.</p>}
        </div>
      </div>

      {/* 회비 내역 */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="font-semibold text-gray-900">회비 내역</h3>
          {canManage && <Button size="sm" onClick={() => setShowAdd(true)}>+ 내역 추가</Button>}
        </div>
        <div className="divide-y divide-gray-100">
          {fees.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`text-xs font-semibold shrink-0 ${f.type === '입금' ? 'text-green-600' : 'text-red-600'}`}>{f.type}</span>
              <span className="flex-1 text-sm text-gray-900">{f.description}</span>
              <span className={`text-sm font-semibold shrink-0 ${f.type === '입금' ? 'text-green-600' : 'text-red-600'}`}>
                {f.type === '입금' ? '+' : '-'}{formatCurrency(f.amount)}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(f.created_at)}</span>
              {f.receipt_url && <a href={f.receipt_url} target="_blank" className="text-xs text-blue-600 shrink-0">영수증</a>}
            </div>
          ))}
          {fees.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-500">회비 내역이 없습니다.</p>}
        </div>
      </div>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="회비 내역 추가"
        confirmLabel="추가" onConfirm={handleAddFee} loading={loading}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            {(['입금', '지출'] as FeeType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={t} checked={type === t} onChange={() => setType(t)} />
                <span className="text-sm">{t}</span>
              </label>
            ))}
          </div>
          <Input label="금액 (원)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} required />
          <Input label="설명" value={desc} onChange={(e) => setDesc(e.target.value)} required />
        </div>
      </Dialog>
    </div>
  )
}
