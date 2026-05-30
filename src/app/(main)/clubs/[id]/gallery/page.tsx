import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { GalleryClient } from './GalleryClient'

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from('gallery_items')
    .select('*, uploader:users(name)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  return <GalleryClient items={items ?? []} clubId={clubId} userId={user!.id} />
}
