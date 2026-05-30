import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FeesClient } from './FeesClient'
import type { Role } from '@/types'

export default async function FeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: fees }, { data: feeStatuses }, { data: membership }] = await Promise.all([
    supabase.from('fees').select('*, author:users(name)').eq('club_id', clubId).order('created_at', { ascending: false }),
    supabase.from('member_fee_status').select('*, user:users(name)').eq('club_id', clubId),
    supabase.from('club_members').select('role').eq('club_id', clubId).eq('user_id', user!.id).single(),
  ])

  const role = membership?.role as Role | undefined
  const canManage = role === '방장' || role === '임원' || role === '총무'

  const totalIn = (fees ?? []).filter((f) => f.type === '입금').reduce((s, f) => s + f.amount, 0)
  const totalOut = (fees ?? []).filter((f) => f.type === '지출').reduce((s, f) => s + f.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">회비 관리</h2>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '총 입금액', value: totalIn, color: 'text-green-600' },
          { label: '총 지출액', value: totalOut, color: 'text-red-600' },
          { label: '현재 잔액', value: totalIn - totalOut, color: 'text-blue-600' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`mt-1 text-xl font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <FeesClient fees={fees ?? []} feeStatuses={feeStatuses ?? []} canManage={canManage} clubId={clubId} userId={user!.id} />
    </div>
  )
}
