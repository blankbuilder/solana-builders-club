import Link from 'next/link'
import { getAdminAuth } from '@/lib/admin'

export default async function AdminHeaderLink() {
  const auth = await getAdminAuth()

  if (auth.status !== 'authorized') {
    return null
  }

  return (
    <Link
      href="/admin"
      className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
    >
      Admin
    </Link>
  )
}
