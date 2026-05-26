import type { PerkStatus } from '@/types'

export const perkStatuses: PerkStatus[] = ['submitted', 'approved', 'rejected', 'paused', 'archived']

const allowedLogoTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
const maxLogoBytes = 1_000_000

export interface PerkFormInput {
  telegramUsername: string
  projectName: string
  projectDescription: string
  projectWebsite: string
  logoDataUrl: string
  offerTitle: string
  offerTerms: string
  offerCode: string | null
}

export interface AdminPerkFormInput extends PerkFormInput {
  status: PerkStatus
  featured: boolean
  rejectionReason: string | null
}

export async function parsePartnerPerkForm(formData: FormData): Promise<PerkFormInput> {
  return parsePerkForm(formData, { requireLogo: true })
}

export async function parseAdminPerkForm(formData: FormData): Promise<AdminPerkFormInput> {
  return {
    ...(await parsePerkForm(formData, { requireLogo: false })),
    status: enumValue(formData, 'status', perkStatuses, 'Status'),
    featured: formData.get('featured') === 'on',
    rejectionReason: optionalText(formData, 'rejectionReason'),
  }
}

export function parseFormError(error: unknown): string {
  return error instanceof Error ? error.message : 'Invalid form submission'
}

async function parsePerkForm(
  formData: FormData,
  { requireLogo }: { requireLogo: boolean }
): Promise<PerkFormInput> {
  return {
    telegramUsername: requiredTelegramUsername(formData, 'telegramUsername', 'Telegram username'),
    projectName: requiredText(formData, 'projectName', 'Project name'),
    projectDescription: requiredText(formData, 'projectDescription', 'Project description'),
    projectWebsite: requiredUrl(formData, 'projectWebsite', 'Project website'),
    logoDataUrl: await logoDataUrl(formData, { requireLogo }),
    offerTitle: requiredText(formData, 'offerTitle', 'Offer title'),
    offerTerms: requiredText(formData, 'offerTerms', 'Offer terms'),
    offerCode: optionalText(formData, 'offerCode'),
  }
}

function requiredText(formData: FormData, key: string, label: string): string {
  const value = optionalText(formData, key)

  if (!value) {
    throw new Error(`${label} is required`)
  }

  return value
}

function optionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key)

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function requiredTelegramUsername(formData: FormData, key: string, label: string): string {
  const value = requiredText(formData, key, label)
  const normalized = value.startsWith('@') ? value : `@${value}`

  if (!/^@[A-Za-z0-9_]{5,32}$/.test(normalized)) {
    throw new Error(`${label} must be a valid @username`)
  }

  return normalized
}

function requiredUrl(formData: FormData, key: string, label: string): string {
  const value = requiredText(formData, key, label)

  try {
    const url = new URL(value)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error()
    }

    return url.toString()
  } catch {
    throw new Error(`${label} must be a valid URL`)
  }
}

async function logoDataUrl(
  formData: FormData,
  { requireLogo }: { requireLogo: boolean }
): Promise<string> {
  const value = formData.get('logo')

  if (value instanceof File && value.size > 0) {
    if (!allowedLogoTypes.has(value.type)) {
      throw new Error('Logo must be a PNG, JPEG, WebP, or SVG image')
    }

    if (value.size > maxLogoBytes) {
      throw new Error('Logo must be 1 MB or smaller')
    }

    const bytes = Buffer.from(await value.arrayBuffer()).toString('base64')

    return `data:${value.type};base64,${bytes}`
  }

  const existingLogo = optionalText(formData, 'existingLogoDataUrl')

  if (existingLogo) {
    return existingLogo
  }

  if (requireLogo) {
    throw new Error('Logo is required')
  }

  return ''
}

function enumValue<T extends string>(
  formData: FormData,
  key: string,
  values: readonly T[],
  label: string
): T {
  const value = requiredText(formData, key, label)

  if (!values.includes(value as T)) {
    throw new Error(`${label} is invalid`)
  }

  return value as T
}
