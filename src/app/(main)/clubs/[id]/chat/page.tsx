'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'
import type { ChatMessage, User } from '@/types'
import { useParams } from 'next/navigation'

type MsgWithSender = ChatMessage & { sender: User }

export default function ChatPage() {
  const params = useParams()
  const clubId = params.id as string
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState<MsgWithSender[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
      setCurrentUser(profile)

      const { data } = await supabase
        .from('chat_messages')
        .select('*, sender:users(*)')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(50)
      setMessages((data ?? []).reverse() as MsgWithSender[])
    }
    init()

    const channel = supabase
      .channel(`chat:${clubId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `club_id=eq.${clubId}` },
        async (payload) => {
          const { data } = await supabase.from('chat_messages').select('*, sender:users(*)').eq('id', payload.new.id).single()
          if (data) setMessages((prev) => [...prev, data as MsgWithSender])
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `club_id=eq.${clubId}` },
        (payload) => {
          setMessages((prev) => prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } : m))
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clubId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage() {
    if (!text.trim() || !currentUser) return
    setLoading(true)
    await supabase.from('chat_messages').insert({ club_id: clubId, sender_id: currentUser.id, content: text.trim() })
    setText('')
    setLoading(false)
  }

  async function deleteMessage(id: string) {
    await supabase.from('chat_messages').update({ is_deleted: true, content: null }).eq('id', id)
  }

  const displayMessages = messages.filter((m) => !m.is_deleted || currentUser?.id === m.sender_id)

  return (
    <div className="flex h-full flex-col" style={{ height: 'calc(100vh - 13rem)' }}>
      <h2 className="mb-3 text-lg font-semibold shrink-0">채팅방</h2>
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
        {displayMessages.map((msg) => {
          const isMine = msg.sender_id === currentUser?.id
          if (msg.is_deleted) {
            return (
              <div key={msg.id} className="flex gap-2 items-start">
                <div className="text-xs text-gray-400 italic">삭제된 메시지입니다.</div>
              </div>
            )
          }
          return (
            <div key={msg.id} className={`flex gap-2 items-start ${isMine ? 'flex-row-reverse' : ''}`}>
              <Avatar name={msg.sender?.name ?? '?'} size="sm" />
              <div className={`max-w-xs ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMine && <span className="text-xs font-medium text-gray-600">{msg.sender?.name}</span>}
                <div className={`rounded-2xl px-3 py-2 text-sm ${isMine ? 'bg-cbnu-red text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                  {msg.content}
                  {msg.image_url && <img src={msg.image_url} alt="" className="mt-2 max-w-[200px] rounded-lg" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatRelativeTime(msg.created_at)}</span>
                  {isMine && (
                    <button onClick={() => deleteMessage(msg.id)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage() }}
        className="mt-3 flex gap-2 shrink-0"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cbnu-red focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="rounded-xl bg-cbnu-red px-4 py-2.5 text-sm font-medium text-white hover:bg-cbnu-red-hover disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  )
}
