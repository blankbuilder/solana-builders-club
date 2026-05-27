'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface AdminToastProps {
  successMessage?: string
}

export function AdminToast({ successMessage = 'Perk updated.' }: AdminToastProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const admin = searchParams.get('admin')
    const adminError = searchParams.get('admin_error')

    if (!admin && !adminError) return

    if (admin) {
      toast.success(successMessage)
    }
    if (adminError) {
      toast.error(adminError)
    }

    const next = new URLSearchParams(searchParams.toString())
    next.delete('admin')
    next.delete('admin_error')
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams, successMessage])

  return null
}
