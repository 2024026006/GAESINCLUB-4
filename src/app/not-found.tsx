import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-lg text-gray-600">페이지를 찾을 수 없습니다.</p>
      <Link href="/clubs" className="mt-6 rounded-lg bg-cbnu-red px-4 py-2 text-sm font-medium text-white hover:bg-cbnu-red-hover">
        홈으로
      </Link>
    </div>
  )
}
