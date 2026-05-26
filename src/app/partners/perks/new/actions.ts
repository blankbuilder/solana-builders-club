'use server'

import { redirect } from 'next/navigation'
import { createSubmittedPerk, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import { parseFormError, parsePartnerPerkForm } from '@/lib/perks/validation'

export async function submitPartnerPerk(formData: FormData) {
  let redirectTo = '/partners/perks/new?submitted=1'

  if (!isPerksDatabaseConfigured()) {
    redirect('/partners/perks/new?error=database')
  }

  try {
    const input = await parsePartnerPerkForm(formData)
    await createSubmittedPerk(input)
  } catch (error) {
    redirectTo = `/partners/perks/new?error=${encodeURIComponent(parseFormError(error))}`
  }

  redirect(redirectTo)
}
