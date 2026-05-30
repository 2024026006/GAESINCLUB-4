export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/Toast'
import type { User } from '@/types'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/signup/complete')

  return (
    <ToastProvider>
      <style>{`
        #sidebar-wrap { display: none; }
        #bottom-nav-wrap { display: block; }
        #main-content { padding-bottom: 56px; }
        @media (min-width: 768px) {
          #sidebar-wrap { display: flex; }
          #bottom-nav-wrap { display: none; }
          #main-content { padding-bottom: 0; }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <div id="sidebar-wrap">
          <Sidebar user={profile as User} />
        </div>
        <main id="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <div id="bottom-nav-wrap">
        <BottomNav user={profile as User} />
      </div>
    </ToastProvider>
  )
}
