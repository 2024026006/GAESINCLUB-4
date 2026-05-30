export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">개신클럽</h1>
        <p className="mt-1 text-sm text-gray-500">충북대학교 중앙 동아리 플랫폼</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
