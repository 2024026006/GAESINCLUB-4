'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

interface SidebarProps {
  user: User
}

const NAV_ITEMS = [
  { href: '/clubs', label: '동아리 탐색', icon: '🏠' },
  { href: '/mypage/profile', label: '마이페이지', icon: '👤' },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-100 px-4">
        <Link href="/clubs" className="text-lg font-bold text-blue-600">
          개신클럽
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.department}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </aside>
  )
}
