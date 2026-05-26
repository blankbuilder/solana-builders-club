'use server'

import { redirect } from 'next/navigation'
import { createSubmittedPerk, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import { parseFieldError, parsePartnerPerkForm } from '@/lib/perks/validation'

export interface PartnerPerkFormState {
  errors?: Record<string, string>
  formError?: string
}

export async function submitPartnerPerk(
  _prevState: PartnerPerkFormState,
  formData: FormData
): Promise<PartnerPerkFormState> {
  if (!isPerksDatabaseConfigured()) {
    return { formError: 'Perk submissions are temporarily unavailable. Please try again later.' }
  }

  try {
    const input = await parsePartnerPerkForm(formData)
    await createSubmittedPerk(input)
  } catch (error) {
    const { field, message } = parseFieldError(error)
    return field ? { errors: { [field]: message } } : { formError: message }
  }

  redirect('/partners/perks/new?submitted=1')
}
