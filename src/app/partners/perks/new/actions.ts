'use server'

import { redirect } from 'next/navigation'
import { createSubmittedPerk, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import {
  parseLogoDataUrl,
  parsePartnerPerkForm,
  parseSubmissionError,
} from '@/lib/perks/validation'

const textFieldNames = [
  'projectName',
  'projectWebsite',
  'projectDescription',
  'offerTitle',
  'offerTerms',
  'offerCode',
  'telegramUsername',
] as const

type TextFieldName = (typeof textFieldNames)[number]
type LogoFieldName = 'logoDataUrl' | 'logoFileName'

export type PartnerPerkFormValues = Partial<Record<TextFieldName | LogoFieldName, string>>

export interface PartnerPerkFormState {
  errors?: Record<string, string>
  formError?: string
  revision?: number
  values?: PartnerPerkFormValues
}

export async function submitPartnerPerk(
  prevState: PartnerPerkFormState,
  formData: FormData
): Promise<PartnerPerkFormState> {
  let input

  try {
    input = await parsePartnerPerkForm(formData)
  } catch (error) {
    return {
      ...parseSubmissionError(error),
      revision: nextRevision(prevState),
      values: await snapshotValues(formData),
    }
  }

  if (!isPerksDatabaseConfigured()) {
    return {
      formError: 'Perk submissions are temporarily unavailable. Please try again later.',
      revision: nextRevision(prevState),
      values: await snapshotValues(formData),
    }
  }

  try {
    await createSubmittedPerk(input)
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : 'Invalid form submission',
      revision: nextRevision(prevState),
      values: await snapshotValues(formData),
    }
  }

  redirect('/partners/perks/new?submitted=1')
}

async function snapshotValues(formData: FormData): Promise<PartnerPerkFormValues> {
  const values: PartnerPerkFormValues = {}
  for (const name of textFieldNames) {
    const value = formData.get(name)
    if (typeof value === 'string') {
      values[name] = value
    }
  }

  const logoDataUrl = await snapshotLogoDataUrl(formData)
  if (logoDataUrl) {
    values.logoDataUrl = logoDataUrl
  }

  const logoFileName = logoDataUrl ? snapshotLogoFileName(formData) : null
  if (logoFileName) {
    values.logoFileName = logoFileName
  }

  return values
}

async function snapshotLogoDataUrl(formData: FormData): Promise<string | null> {
  try {
    return await parseLogoDataUrl(formData, { requireLogo: false })
  } catch {
    return null
  }
}

function snapshotLogoFileName(formData: FormData): string | null {
  const logo = formData.get('logo')

  if (logo instanceof File && logo.size > 0) {
    return logo.name
  }

  const existingLogoFileName = formData.get('existingLogoFileName')

  return typeof existingLogoFileName === 'string' && existingLogoFileName.trim()
    ? existingLogoFileName
    : null
}

function nextRevision(prevState: PartnerPerkFormState): number {
  return (prevState.revision ?? 0) + 1
}
