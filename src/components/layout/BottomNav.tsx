'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { User } from '@/types'

const NAV_ITEMS = [
  { href: '/clubs', label: '동아리', icon: '🏠' },
  { href: '/mypage/profile', label: '마이페이지', icon: '👤' },
]

export function BottomNav({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center border-t border-gray-200 bg-white px-2">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors',
            pathname.startsWith(item.href)
              ? 'text-cbnu-red'
              : 'text-gray-500'
          )}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      {/* 아바타 버튼 — 마이페이지로 이동 */}
      <Link
        href="/mypage/profile"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
      >
        <Avatar name={user.name} size="sm" />
        <span className="text-xs text-gray-500 truncate max-w-[60px]">{user.name}</span>
      </Link>
    </nav>
  )
}