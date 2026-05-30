import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

const COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-purple-500', 'bg-pink-500',
]

function colorFromName(name: string) {
  let hash = 0
  for (const ch of name) hash += ch.charCodeAt(0)
  return COLORS[hash % COLORS.length]
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        colorFromName(name),
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  )
}
