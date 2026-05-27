'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const telegramMessages: Record<string, string> = {
  connected: 'Telegram connected. Member-only claim links are unlocked.',
}

const telegramErrors: Record<string, string> = {
  config: 'Telegram login is not configured yet.',
  state: 'Telegram login expired. Try connecting again.',
  denied: 'Telegram login was not completed.',
  token: 'Telegram could not verify the login.',
  not_member: 'This Telegram account is not currently in the SBC community.',
  membership: 'Telegram membership could not be checked. Try again shortly.',
}

export function TelegramToast() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageKey = searchParams.get('telegram')
    const errorKey = searchParams.get('telegram_error')

    if (!messageKey && !errorKey) return

    if (messageKey) {
      toast.success(telegramMessages[messageKey] ?? 'Telegram connected.')
    }
    if (errorKey) {
      toast.error(telegramErrors[errorKey] ?? 'Telegram login failed.')
    }

    const next = new URLSearchParams(searchParams.toString())
    next.delete('telegram')
    next.delete('telegram_error')
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  return null
}
