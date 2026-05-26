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
      className="nav-link hidden sm:inline"
    >
      Admin
    </Link>
  )
}
