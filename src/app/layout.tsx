import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '개신클럽 — 충북대학교 중앙 동아리 플랫폼',
  description: '충북대학교 중앙 동아리의 가입 신청, 활동 관리, 커뮤니케이션을 통합 지원합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
