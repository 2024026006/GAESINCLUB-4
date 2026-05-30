import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = 'noreply@gaesinclub.cbnu.ac.kr'

interface NotificationPayload {
  type:
    | 'join_request'
    | 'join_approved'
    | 'join_rejected'
    | 'notice_created'
    | 'post_created'
    | 'comment_created'
    | 'event_created'
    | 'chat_activated'
  club_id: string
  club_name: string
  actor_name?: string
  target_user_ids?: string[]
  extra?: Record<string, string>
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  return res.ok
}

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let subject = ''
    let html = ''
    let recipientIds: string[] = payload.target_user_ids ?? []

    switch (payload.type) {
      case 'join_request': {
        // 방장에게 발송
        const { data: leader } = await supabase
          .from('club_members')
          .select('user_id, users(name)')
          .eq('club_id', payload.club_id)
          .eq('role', '방장')
          .single()
        if (leader) recipientIds = [leader.user_id]
        subject = `[개신클럽] ${payload.club_name} 가입 신청이 접수되었습니다`
        html = `<p><strong>${payload.actor_name}</strong>님이 <strong>${payload.club_name}</strong>에 가입 신청을 하였습니다.</p><p>개신클럽에서 확인하고 승인해주세요.</p>`
        break
      }
      case 'join_approved': {
        subject = `[개신클럽] ${payload.club_name} 가입이 승인되었습니다`
        html = `<p><strong>${payload.club_name}</strong> 가입 신청이 승인되었습니다. 환영합니다!</p>`
        break
      }
      case 'join_rejected': {
        subject = `[개신클럽] ${payload.club_name} 가입 신청 결과 안내`
        html = `<p><strong>${payload.club_name}</strong> 가입 신청이 거절되었습니다. 다음 기회를 기다려주세요.</p>`
        break
      }
      case 'notice_created': {
        subject = `[개신클럽] ${payload.club_name} 새 공지사항이 등록되었습니다`
        html = `<p><strong>${payload.club_name}</strong>에 새로운 공지사항이 등록되었습니다: <strong>${payload.extra?.title ?? ''}</strong></p>`
        break
      }
      case 'post_created': {
        subject = `[개신클럽] ${payload.club_name} 새 게시글이 등록되었습니다`
        html = `<p><strong>${payload.actor_name}</strong>님이 <strong>${payload.club_name}</strong> 게시판에 글을 올렸습니다: ${payload.extra?.title ?? ''}</p>`
        break
      }
      case 'comment_created': {
        subject = `[개신클럽] 게시글에 댓글이 달렸습니다`
        html = `<p><strong>${payload.actor_name}</strong>님이 회원님의 게시글에 댓글을 남겼습니다.</p>`
        break
      }
      case 'event_created': {
        subject = `[개신클럽] ${payload.club_name} 새 행사 일정이 등록되었습니다`
        html = `<p><strong>${payload.club_name}</strong>에 새로운 행사가 등록되었습니다: <strong>${payload.extra?.title ?? ''}</strong> (${payload.extra?.start_at ?? ''})</p>`
        break
      }
      case 'chat_activated': {
        subject = `[개신클럽] ${payload.club_name} 채팅방에 메시지가 도착했습니다`
        html = `<p><strong>${payload.club_name}</strong> 채팅방이 활성화되었습니다. 개신클럽에서 확인하세요.</p>`
        break
      }
    }

    if (!subject) {
      return new Response(JSON.stringify({ ok: false, error: 'unknown type' }), { status: 400 })
    }

    // 수신자 이메일 조회
    if (recipientIds.length === 0 && !payload.target_user_ids) {
      // 전체 부원
      const { data: members } = await supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', payload.club_id)
      recipientIds = (members ?? []).map((m: { user_id: string }) => m.user_id)
    }

    const results = await Promise.allSettled(
      recipientIds.map(async (uid) => {
        const { data } = await supabase.auth.admin.getUserById(uid)
        if (!data.user?.email) return
        await sendEmail(data.user.email, subject, html)
        await supabase.from('notifications').insert({
          user_id: uid,
          type: payload.type,
          payload,
          success: true,
        })
      })
    )

    return new Response(JSON.stringify({ ok: true, results: results.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
  }
})
