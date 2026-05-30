import { redirect } from 'next/navigation'

export default async function ClubRootPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/clubs/${id}/notices`)
}
