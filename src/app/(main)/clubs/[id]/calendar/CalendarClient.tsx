'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'
import type { VoteOption } from '@/types'

interface EventData {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  votes: Array<{ user_id: string; vote: string }>
}

interface CalendarClientProps {
  events: EventData[]
  clubId: string
  userId: string
  canManage: boolean
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const VOTE_LABELS: Record<VoteOption, string> = { 참석: '✅ 참석', 불참: '❌ 불참', 미정: '🤔 미정' }

export function CalendarClient({ events, clubId, userId, canManage }: CalendarClientProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [loading, setLoading] = useState(false)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  function eventsOnDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.start_at.startsWith(dateStr))
  }

  const selectedEvents = selectedDate
    ? events.filter((e) => e.start_at.startsWith(selectedDate))
    : []

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  async function handleAddEvent() {
    if (!newTitle || !newStart) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').insert({
      club_id: clubId, author_id: user!.id,
      title: newTitle, description: newDesc || null,
      start_at: newStart, end_at: newEnd || null,
    })
    setLoading(false)
    setShowAddForm(false)
    setNewTitle(''); setNewDesc(''); setNewStart(''); setNewEnd('')
    router.refresh()
  }

  async function handleVote(eventId: string, vote: VoteOption) {
    await supabase.from('event_votes').upsert({ event_id: eventId, user_id: userId, vote }, { onConflict: 'event_id,user_id' })
    router.refresh()
  }

  async function handleDeleteEvent(eventId: string) {
    await supabase.from('events').delete().eq('id', eventId)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="rounded p-1 hover:bg-gray-100">‹</button>
          <h2 className="text-lg font-semibold">{year}년 {MONTHS[month]}</h2>
          <button onClick={nextMonth} className="rounded p-1 hover:bg-gray-100">›</button>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setShowAddForm(true)}>+ 행사 추가</Button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="border-b border-r border-gray-100 h-20" />
            const dayEvents = eventsOnDay(day)
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSelected = selectedDate === dateStr
            const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`border-b border-r border-gray-100 h-20 p-1.5 text-left text-xs transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>{day}</span>
                {dayEvents.slice(0, 2).map((e) => (
                  <div key={e.id} className="mt-0.5 truncate rounded bg-blue-100 px-1 text-blue-700">{e.title}</div>
                ))}
                {dayEvents.length > 2 && <div className="text-gray-400">+{dayEvents.length - 2}</div>}
              </button>
            )
          })}
        </div>
      </div>

      {selectedEvents.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {selectedEvents.map((e) => {
            const myVote = e.votes.find((v) => v.user_id === userId)?.vote as VoteOption | undefined
            const voteCounts = { 참석: 0, 불참: 0, 미정: 0 }
            e.votes.forEach((v) => { if (v.vote in voteCounts) (voteCounts as any)[v.vote]++ })
            return (
              <div key={e.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{e.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(e.start_at)}</p>
                    {e.description && <p className="mt-2 text-sm text-gray-600">{e.description}</p>}
                  </div>
                  {canManage && (
                    <button onClick={() => handleDeleteEvent(e.id)} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['참석', '불참', '미정'] as VoteOption[]).map((v) => (
                    <button key={v} onClick={() => handleVote(e.id, v)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${myVote === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {VOTE_LABELS[v]} {voteCounts[v]}명
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} title="행사 추가"
        confirmLabel="추가" onConfirm={handleAddEvent} loading={loading}>
        <div className="flex flex-col gap-3">
          <Input label="행사명" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <Input label="시작 일시" type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} required />
          <Input label="종료 일시 (선택)" type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">설명 (선택)</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
