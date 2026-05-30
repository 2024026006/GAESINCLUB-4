'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface ClubSearchBarProps {
  currentQ?: string
  currentCategory?: string
  currentRecruit?: string
}

export function ClubSearchBar({ currentQ, currentRecruit }: ClubSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(currentQ ?? '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    else params.delete('q')
    router.push(`/clubs?${params}`)
  }

  return (
    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="동아리 이름 검색..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        검색
      </button>
      <select
        value={currentRecruit ?? ''}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString())
          if (e.target.value) params.set('recruit', e.target.value)
          else params.delete('recruit')
          router.push(`/clubs?${params}`)
        }}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
      >
        <option value="">모집 상태 전체</option>
        <option value="모집 중">모집 중</option>
        <option value="모집 마감">모집 마감</option>
      </select>
    </form>
  )
}
