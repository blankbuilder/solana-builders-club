import { NextRequest, NextResponse } from 'next/server'
import {
  getTelegramConfig,
  isSecureRequest,
  telegramCookieNames,
  telegramOauthMaxAge,
} from '@/lib/telegram/config'
import { createPkceChallenge, randomToken } from '@/lib/telegram/pkce'
import { normalizeReturnTo, withTelegramParam } from '@/lib/telegram/return-to'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const configResult = getTelegramConfig(request)
  const returnTo = normalizeReturnTo(request.nextUrl.searchParams.get('returnTo'))

  if (!configResult.ok) {
    return NextResponse.redirect(new URL(withTelegramParam(returnTo, 'telegram_error', 'config'), request.url))
  }

  const state = randomToken()
  const nonce = randomToken()
  const verifier = randomToken(64)
  const challenge = createPkceChallenge(verifier)
  const authUrl = new URL('https://oauth.telegram.org/auth')

  authUrl.searchParams.set('client_id', configResult.config.clientId)
  authUrl.searchParams.set('redirect_uri', configResult.config.redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('nonce', nonce)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  const response = NextResponse.redirect(authUrl)
  const cookieOptions = {
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: telegramOauthMaxAge,
  }

  response.cookies.set(telegramCookieNames.state, state, cookieOptions)
  response.cookies.set(telegramCookieNames.nonce, nonce, cookieOptions)
  response.cookies.set(telegramCookieNames.pkceVerifier, verifier, cookieOptions)
  response.cookies.set(telegramCookieNames.returnTo, returnTo, cookieOptions)

  return response
}
