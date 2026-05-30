import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { error } = await supabase
    .from('join_requests')
    .insert({ club_id: clubId, user_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.redirect(new URL(`/clubs/${clubId}`, _request.url))
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 방장에게 알림 발송 (비동기, 실패해도 무시)
  const { data: club } = await supabase.from('clubs').select('name').eq('id', clubId).single()
  const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single()

  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      type: 'join_request',
      club_id: clubId,
      club_name: club?.name ?? '',
      actor_name: profile?.name ?? '',
    }),
  }).catch(() => {})

  return NextResponse.redirect(new URL(`/clubs/${clubId}`, _request.url))
}
