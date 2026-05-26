import { NextRequest, NextResponse } from 'next/server'
import { getTelegramConfig } from '@/lib/telegram/config'
import { getCurrentTelegramSession } from '@/lib/telegram/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const configResult = getTelegramConfig(request)
  const session = await getCurrentTelegramSession()

  return NextResponse.json({
    configured: configResult.ok,
    connected: Boolean(session),
    user: session
      ? {
          telegramUserId: session.telegramUserId,
          username: session.username,
          name: session.name,
          memberStatus: session.memberStatus,
          verifiedAt: session.verifiedAt,
        }
      : null,
  })
}
