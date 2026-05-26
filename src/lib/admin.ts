import { getCurrentTelegramSession, type TelegramSession } from '@/lib/telegram/session'

export type AdminAuthState =
  | {
      status: 'authorized'
      session: TelegramSession
    }
  | {
      status: 'anonymous'
      adminIdsConfigured: boolean
    }
  | {
      status: 'forbidden'
      session: TelegramSession
    }
  | {
      status: 'not_configured'
      session: TelegramSession | null
    }

export function getAdminTelegramIds(): string[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? '')
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean)
}

export async function getAdminAuth(): Promise<AdminAuthState> {
  const session = await getCurrentTelegramSession()
  const adminIds = getAdminTelegramIds()

  if (adminIds.length === 0) {
    return { status: 'not_configured', session }
  }

  if (!session) {
    return { status: 'anonymous', adminIdsConfigured: true }
  }

  if (!adminIds.includes(session.telegramUserId)) {
    return { status: 'forbidden', session }
  }

  return { status: 'authorized', session }
}

export async function requireAdminSession(): Promise<TelegramSession> {
  const auth = await getAdminAuth()

  if (auth.status !== 'authorized') {
    throw new Error('Admin access is required')
  }

  return auth.session
}
