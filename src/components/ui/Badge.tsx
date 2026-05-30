import { cn } from '@/lib/utils'
import type { Category, RecruitStatus, Role } from '@/types'

const ROLE_COLORS: Record<Role, string> = {
  '방장': 'bg-purple-100 text-purple-800',
  '임원': 'bg-blue-100 text-blue-800',
  '총무': 'bg-green-100 text-green-800',
  '일반 회원': 'bg-gray-100 text-gray-700',
}

const CATEGORY_COLORS: Record<Category, string> = {
  '교양': 'bg-yellow-100 text-yellow-800',
  '학술': 'bg-blue-100 text-blue-800',
  '문화': 'bg-pink-100 text-pink-800',
  '봉사': 'bg-green-100 text-green-800',
  '체육': 'bg-orange-100 text-orange-800',
  '종교': 'bg-indigo-100 text-indigo-800',
}

interface BadgeProps {
  label: string
  className?: string
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_COLORS[role])}>
      {role}
    </span>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', CATEGORY_COLORS[category])}>
      {category}
    </span>
  )
}

export function RecruitBadge({ status }: { status: RecruitStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      status === '모집 중' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
    )}>
      {status}
    </span>
  )
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700', className)}>
      {label}
    </span>
  )
}
