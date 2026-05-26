import { NextRequest, NextResponse } from 'next/server'
import { getRequestOrigin, telegramCookieNames } from '@/lib/telegram/config'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/perks', getRequestOrigin(request)))

  response.cookies.set(telegramCookieNames.session, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })

  return response
}
