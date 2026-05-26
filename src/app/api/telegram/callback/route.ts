import { NextRequest, NextResponse } from 'next/server'
import {
  getRequestOrigin,
  getTelegramConfig,
  isSecureRequest,
  telegramCookieNames,
  telegramSessionMaxAge,
} from '@/lib/telegram/config'
import { checkTelegramMembership } from '@/lib/telegram/membership'
import { exchangeTelegramCode, verifyTelegramIdToken } from '@/lib/telegram/oidc'
import { normalizeReturnTo, withTelegramParam } from '@/lib/telegram/return-to'
import { createTelegramSessionToken } from '@/lib/telegram/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const denied = request.nextUrl.searchParams.get('error')
  const expectedState = request.cookies.get(telegramCookieNames.state)?.value
  const expectedNonce = request.cookies.get(telegramCookieNames.nonce)?.value
  const codeVerifier = request.cookies.get(telegramCookieNames.pkceVerifier)?.value
  const returnTo = normalizeReturnTo(request.cookies.get(telegramCookieNames.returnTo)?.value)

  if (denied) {
    return redirectAndClear(request, returnTo, 'telegram_error', 'denied')
  }

  if (!code || !state || !expectedState || state !== expectedState || !codeVerifier) {
    return redirectAndClear(request, returnTo, 'telegram_error', 'state')
  }

  const configResult = getTelegramConfig(request)

  if (!configResult.ok) {
    return redirectAndClear(request, returnTo, 'telegram_error', 'config')
  }

  try {
    const tokenResponse = await exchangeTelegramCode({
      clientId: configResult.config.clientId,
      clientSecret: configResult.config.clientSecret,
      code,
      codeVerifier,
      redirectUri: configResult.config.redirectUri,
    })
    const identity = await verifyTelegramIdToken(tokenResponse.idToken, configResult.config.clientId)

    if (expectedNonce && identity.nonce !== expectedNonce) {
      return redirectAndClear(request, returnTo, 'telegram_error', 'token')
    }

    const membership = await checkTelegramMembership({
      botToken: configResult.config.botToken,
      chatId: configResult.config.chatId,
      userId: identity.telegramUserId,
    })

    if (!membership.isMember) {
      return redirectAndClear(
        request,
        returnTo,
        'telegram_error',
        membership.status === 'unknown' ? 'membership' : 'not_member'
      )
    }

    const sessionToken = await createTelegramSessionToken(
      {
        telegramUserId: identity.telegramUserId,
        username: identity.username,
        name: identity.name,
        picture: identity.picture,
        memberStatus: membership.status,
        verifiedAt: new Date().toISOString(),
      },
      configResult.config.sessionSecret
    )
    const response = redirectAndClear(request, returnTo, 'telegram', 'connected')

    response.cookies.set(telegramCookieNames.session, sessionToken, {
      httpOnly: true,
      secure: isSecureRequest(request),
      sameSite: 'lax',
      path: '/',
      maxAge: telegramSessionMaxAge,
    })

    return response
  } catch {
    return redirectAndClear(request, returnTo, 'telegram_error', 'token')
  }
}

function redirectAndClear(
  request: NextRequest,
  returnTo: string,
  key: string,
  value: string
): NextResponse {
  const response = NextResponse.redirect(
    new URL(withTelegramParam(returnTo, key, value), getRequestOrigin(request))
  )

  clearOauthCookies(response)

  return response
}

function clearOauthCookies(response: NextResponse) {
  for (const cookieName of [
    telegramCookieNames.state,
    telegramCookieNames.nonce,
    telegramCookieNames.pkceVerifier,
    telegramCookieNames.returnTo,
  ]) {
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    })
  }
}
