import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import {
  getSessionSecret,
  telegramCookieNames,
  telegramSessionMaxAge,
} from '@/lib/telegram/config'

export interface TelegramSession {
  telegramUserId: string
  username?: string
  name?: string
  picture?: string
  memberStatus: string
  verifiedAt: string
}

export async function createTelegramSessionToken(
  session: TelegramSession,
  secret: string
): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${telegramSessionMaxAge}s`)
    .sign(new TextEncoder().encode(secret))
}

export async function verifyTelegramSessionToken(
  token: string,
  secret: string
): Promise<TelegramSession | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))

    if (typeof payload.telegramUserId !== 'string' || typeof payload.verifiedAt !== 'string') {
      return null
    }

    return {
      telegramUserId: payload.telegramUserId,
      username: typeof payload.username === 'string' ? payload.username : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      memberStatus: typeof payload.memberStatus === 'string' ? payload.memberStatus : 'unknown',
      verifiedAt: payload.verifiedAt,
    }
  } catch {
    return null
  }
}

export async function getCurrentTelegramSession(): Promise<TelegramSession | null> {
  const secret = getSessionSecret()

  if (!secret) {
    return null
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(telegramCookieNames.session)?.value

  if (!token) {
    return null
  }

  return verifyTelegramSessionToken(token, secret)
}
