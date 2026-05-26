import type { PerkStatus } from '@/types'

export const perkStatuses: PerkStatus[] = ['submitted', 'approved', 'rejected', 'paused', 'archived']

const allowedLogoTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
const maxLogoBytes = 1_000_000

export class FormFieldError extends Error {
  readonly field: string

  constructor(field: string, message: string) {
    super(message)
    this.name = 'FormFieldError'
    this.field = field
  }
}

export class FormValidationError extends Error {
  readonly errors: Record<string, string>

  constructor(errors: Record<string, string>) {
    super(Object.values(errors)[0] ?? 'Invalid form submission')
    this.name = 'FormValidationError'
    this.errors = errors
  }
}

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

export function parseSubmissionError(error: unknown): {
  errors?: Record<string, string>
  formError?: string
} {
  if (error instanceof FormValidationError) {
    return { errors: error.errors }
  }
  if (error instanceof FormFieldError) {
    return { errors: { [error.field]: error.message } }
  }
  if (error instanceof Error) {
    return { formError: error.message }
  }
  return { formError: 'Invalid form submission' }
}

async function parsePerkForm(
  formData: FormData,
  { requireLogo }: { requireLogo: boolean }
): Promise<PerkFormInput> {
  const errors: Record<string, string> = {}
  const telegramUsername = collectFieldError(errors, () =>
    requiredTelegramUsername(formData, 'telegramUsername', 'Telegram username')
  )
  const projectName = collectFieldError(errors, () =>
    requiredText(formData, 'projectName', 'Project name')
  )
  const projectDescription = collectFieldError(errors, () =>
    requiredText(formData, 'projectDescription', 'Project description')
  )
  const projectWebsite = collectFieldError(errors, () =>
    requiredUrl(formData, 'projectWebsite', 'Project website')
  )
  const logo = await collectAsyncFieldError(errors, () => parseLogoDataUrl(formData, { requireLogo }))
  const offerTitle = collectFieldError(errors, () =>
    requiredText(formData, 'offerTitle', 'Offer title')
  )
  const offerTerms = collectFieldError(errors, () =>
    requiredText(formData, 'offerTerms', 'Offer terms')
  )

  if (Object.keys(errors).length > 0) {
    throw new FormValidationError(errors)
  }

  return {
    telegramUsername: telegramUsername as string,
    projectName: projectName as string,
    projectDescription: projectDescription as string,
    projectWebsite: projectWebsite as string,
    logoDataUrl: logo as string,
    offerTitle: offerTitle as string,
    offerTerms: offerTerms as string,
    offerCode: optionalText(formData, 'offerCode'),
  }
}

function collectFieldError<T>(errors: Record<string, string>, parse: () => T): T | undefined {
  try {
    return parse()
  } catch (error) {
    if (error instanceof FormFieldError) {
      errors[error.field] = error.message
      return undefined
    }

    throw error
  }
}

async function collectAsyncFieldError<T>(
  errors: Record<string, string>,
  parse: () => Promise<T>
): Promise<T | undefined> {
  try {
    return await parse()
  } catch (error) {
    if (error instanceof FormFieldError) {
      errors[error.field] = error.message
      return undefined
    }

    throw error
  }
}

function requiredText(formData: FormData, key: string, label: string): string {
  const value = optionalText(formData, key)

  if (!value) {
    throw new FormFieldError(key, `${label} is required`)
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
    throw new FormFieldError(
      key,
      `${label} must be 5-32 characters and contain only letters, numbers, or underscores`
    )
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
    throw new FormFieldError(key, `${label} must be a valid URL`)
  }
}

export async function parseLogoDataUrl(
  formData: FormData,
  { requireLogo }: { requireLogo: boolean }
): Promise<string> {
  const value = formData.get('logo')

  if (value instanceof File && value.size > 0) {
    if (!allowedLogoTypes.has(value.type)) {
      throw new FormFieldError('logo', 'Logo must be a PNG, JPEG, WebP, or SVG image')
    }

    if (value.size > maxLogoBytes) {
      throw new FormFieldError('logo', 'Logo must be 1 MB or smaller')
    }

    const bytes = Buffer.from(await value.arrayBuffer()).toString('base64')

    return `data:${value.type};base64,${bytes}`
  }

  const existingLogo = optionalText(formData, 'existingLogoDataUrl')

  if (existingLogo) {
    return existingLogo
  }

  if (requireLogo) {
    throw new FormFieldError('logo', 'Logo is required')
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
    throw new FormFieldError(key, `${label} is invalid`)
  }

  return value as T
}
