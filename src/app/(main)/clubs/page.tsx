import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CategoryBadge, RecruitBadge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import type { Category, RecruitStatus } from '@/types'
import { ClubSearchBar } from './ClubSearchBar'

const CATEGORIES: Category[] = ['교양', '학술', '문화', '봉사', '체육', '종교']

async function ClubList({ q, category, recruit }: { q?: string; category?: Category; recruit?: RecruitStatus }) {
  const supabase = await createClient()
  let query = supabase
    .from('clubs')
    .select('id, name, category, recruit_status, intro, founded_year')
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)
  if (category) query = query.eq('category', category)
  if (recruit) query = query.eq('recruit_status', recruit)

  const { data: clubs = [] } = await query

  if (!clubs?.length) {
    return <p className="py-20 text-center text-gray-500">검색 결과가 없습니다.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club) => (
        <Link
          key={club.id}
          href={`/clubs/${club.id}`}
          className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:border-cbnu-red/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{club.name}</h3>
            <RecruitBadge status={club.recruit_status as RecruitStatus} />
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={club.category as Category} />
            <span className="text-xs text-gray-400">{club.founded_year}년 창설</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{club.intro || '소개가 없습니다.'}</p>
        </Link>
      ))}
    </div>
  )
}

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; recruit?: string }>
}) {
  const { q, category, recruit } = await searchParams

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">동아리 탐색</h1>
        <Link
          href="/clubs/new"
          className="rounded-lg bg-cbnu-red px-4 py-2 text-sm font-medium text-white hover:bg-cbnu-red-hover"
        >
          + 동아리 개설
        </Link>
      </div>

      <Suspense fallback={null}>
        <ClubSearchBar currentQ={q} currentCategory={category} currentRecruit={recruit} />
      </Suspense>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/clubs"
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!category ? 'bg-cbnu-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          전체
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/clubs?${new URLSearchParams({ ...(q && { q }), category: cat, ...(recruit && { recruit }) })}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${category === cat ? 'bg-cbnu-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <Suspense fallback={<PageLoader />}>
        <ClubList q={q} category={category as Category | undefined} recruit={recruit as RecruitStatus | undefined} />
      </Suspense>
    </div>
  )
}
