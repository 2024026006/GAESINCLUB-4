'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const TABS = [
  { label: '공지사항', path: 'notices' },
  { label: '게시판', path: 'board' },
  { label: '갤러리', path: 'gallery' },
  { label: '캘린더', path: 'calendar' },
  { label: '회비', path: 'fees' },
  { label: '채팅', path: 'chat' },
  { label: '부원', path: 'members' },
]

export function ClubNav({ clubId, isMember, role }: { clubId: string; isMember: boolean; role?: Role }) {
  const pathname = usePathname()

  if (!isMember) return null

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
      {TABS.map((tab) => {
        const href = `/clubs/${clubId}/${tab.path}`
        const active = pathname.startsWith(href)
        return (
          <Link
            key={tab.path}
            href={href}
            className={cn(
              'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              active ? 'bg-cbnu-red text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
