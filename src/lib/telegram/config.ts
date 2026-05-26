import type { NextRequest } from 'next/server'

export const telegramCookieNames = {
  state: 'sbc_tg_state',
  pkceVerifier: 'sbc_tg_pkce',
  nonce: 'sbc_tg_nonce',
  returnTo: 'sbc_tg_return_to',
  session: 'sbc_tg_session',
} as const

export const telegramSessionMaxAge = 7 * 24 * 60 * 60
export const telegramOauthMaxAge = 10 * 60

export interface TelegramConfig {
  clientId: string
  clientSecret: string
  botToken: string
  chatId: string
  sessionSecret: string
  siteUrl: string
  redirectUri: string
}

export type TelegramConfigResult =
  | {
      ok: true
      config: TelegramConfig
    }
  | {
      ok: false
      missing: string[]
    }

export function getTelegramConfig(request: NextRequest): TelegramConfigResult {
  const values = {
    TELEGRAM_CLIENT_ID: process.env.TELEGRAM_CLIENT_ID,
    TELEGRAM_CLIENT_SECRET: process.env.TELEGRAM_CLIENT_SECRET,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    TELEGRAM_SESSION_SECRET: process.env.TELEGRAM_SESSION_SECRET,
  }

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (values.TELEGRAM_SESSION_SECRET && values.TELEGRAM_SESSION_SECRET.length < 32) {
    missing.push('TELEGRAM_SESSION_SECRET_32_CHAR_MINIMUM')
  }

  if (missing.length > 0) {
    return { ok: false, missing }
  }

  return {
    ok: true,
    config: {
      clientId: values.TELEGRAM_CLIENT_ID!,
      clientSecret: values.TELEGRAM_CLIENT_SECRET!,
      botToken: values.TELEGRAM_BOT_TOKEN!,
      chatId: values.TELEGRAM_CHAT_ID!,
      sessionSecret: values.TELEGRAM_SESSION_SECRET!,
      siteUrl: getRequestOrigin(request),
      redirectUri: getTelegramRedirectUri(request),
    },
  }
}

export function getSessionSecret(): string | null {
  const secret = process.env.TELEGRAM_SESSION_SECRET

  if (!secret || secret.length < 32) {
    return null
  }

  return secret
}

export function getRequestOrigin(request: NextRequest): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  if (configuredSiteUrl) {
    return configuredSiteUrl
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const protocol =
    request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')

  if (!host) {
    return 'http://localhost:3000'
  }

  return `${protocol}://${host}`
}

export function getTelegramRedirectUri(request: NextRequest): string {
  const configuredRedirectUri = process.env.TELEGRAM_REDIRECT_URI

  if (configuredRedirectUri) {
    return configuredRedirectUri
  }

  return `${getRequestOrigin(request)}/api/telegram/callback`
}

export function isSecureRequest(request?: NextRequest): boolean {
  if (process.env.NODE_ENV === 'production') {
    return true
  }

  const protocol =
    request?.headers.get('x-forwarded-proto') ?? request?.nextUrl.protocol.replace(':', '')

  return protocol === 'https'
}
