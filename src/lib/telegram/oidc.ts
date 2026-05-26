import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

const telegramIssuer = 'https://oauth.telegram.org'
const telegramTokenEndpoint = 'https://oauth.telegram.org/token'
const telegramJwksUri = new URL('https://oauth.telegram.org/.well-known/jwks.json')

let telegramJwks: ReturnType<typeof createRemoteJWKSet> | null = null

export interface TelegramTokenResponse {
  accessToken: string
  idToken: string
  expiresIn: number | null
}

export interface TelegramIdentity {
  telegramUserId: string
  username?: string
  name?: string
  picture?: string
  nonce?: string
}

type RawTokenResponse = {
  access_token?: string
  id_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type TelegramIdTokenPayload = JWTPayload & {
  id?: string | number
  preferred_username?: string
  name?: string
  picture?: string
  nonce?: string
}

export async function exchangeTelegramCode({
  clientId,
  clientSecret,
  code,
  codeVerifier,
  redirectUri,
}: {
  clientId: string
  clientSecret: string
  code: string
  codeVerifier: string
  redirectUri: string
}): Promise<TelegramTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })

  const response = await fetch(telegramTokenEndpoint, {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })

  const data = (await response.json().catch(() => ({}))) as RawTokenResponse

  if (!response.ok || !data.id_token || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? 'Telegram token exchange failed')
  }

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    expiresIn: data.expires_in ?? null,
  }
}

export async function verifyTelegramIdToken(
  idToken: string,
  clientId: string
): Promise<TelegramIdentity> {
  const { payload } = await jwtVerify(idToken, getTelegramJwks(), {
    issuer: telegramIssuer,
    audience: clientId,
  })
  const telegramPayload = payload as TelegramIdTokenPayload
  const telegramUserId = telegramPayload.id ?? telegramPayload.sub

  if (!telegramUserId) {
    throw new Error('Telegram ID token is missing the user id')
  }

  return {
    telegramUserId: String(telegramUserId),
    username: telegramPayload.preferred_username,
    name: telegramPayload.name,
    picture: telegramPayload.picture,
    nonce: telegramPayload.nonce,
  }
}

function getTelegramJwks() {
  telegramJwks ??= createRemoteJWKSet(telegramJwksUri)
  return telegramJwks
}
