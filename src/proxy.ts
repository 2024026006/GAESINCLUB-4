import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 로그인 없이 접근 가능한 경로
  const isPublicPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth')

  // 로그인 후에도 접근 가능해야 하는 경로 (리다이렉트 대상 제외)
  const isSignupFlow =
    pathname.startsWith('/signup')

  if (!user && !isPublicPage && !isSignupFlow) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 로그인 유저가 로그인/비밀번호재설정 페이지에 접근하면 /clubs로 보냄
  // /signup/complete는 프로필 미완성 유저가 거쳐야 하므로 리다이렉트하지 않음
  if (user && isPublicPage) {
    return NextResponse.redirect(new URL('/clubs', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
