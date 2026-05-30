'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/mypage/profile', label: '프로필' },
  { href: '/mypage/clubs', label: '내 동아리' },
  { href: '/mypage/settings', label: '설정' },
]

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">마이페이지</h1>
      <nav className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href}
            className={cn(
              'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-colors',
              pathname === tab.href ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}>
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
