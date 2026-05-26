'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin'
import {
  setPerkFeatured,
  setPerkStatus,
  updateAdminPerk,
} from '@/lib/perks/queries'
import { parseAdminPerkForm, parseFormError, perkStatuses } from '@/lib/perks/validation'

type StatusAction = 'approved' | 'rejected' | 'paused' | 'archived'

export async function setPerkStatusAction(formData: FormData) {
  let redirectTo = '/admin/perks?admin=updated'

  try {
    const session = await requireAdminSession()
    const id = requiredFormValue(formData, 'id')
    const status = requiredFormValue(formData, 'status')

    if (!isStatusAction(status)) {
      throw new Error('Status action is invalid')
    }

    await setPerkStatus({
      id,
      status,
      rejectionReason: optionalFormValue(formData, 'rejectionReason'),
      actorTelegramId: session.telegramUserId,
      actorName: session.name ?? session.username ?? null,
    })
    revalidatePerkPaths(id)
  } catch (error) {
    redirectTo = `/admin/perks?admin_error=${encodeURIComponent(parseFormError(error))}`
  }

  redirect(redirectTo)
}

export async function setPerkFeaturedAction(formData: FormData) {
  let redirectTo = '/admin/perks?admin=updated'

  try {
    const session = await requireAdminSession()
    const id = requiredFormValue(formData, 'id')
    const featured = requiredFormValue(formData, 'featured') === 'true'

    await setPerkFeatured({
      id,
      featured,
      actorTelegramId: session.telegramUserId,
      actorName: session.name ?? session.username ?? null,
    })
    revalidatePerkPaths(id)
  } catch (error) {
    redirectTo = `/admin/perks?admin_error=${encodeURIComponent(parseFormError(error))}`
  }

  redirect(redirectTo)
}

export async function updatePerkAction(formData: FormData) {
  const id = requiredFormValue(formData, 'id')
  let redirectTo = `/admin/perks/${id}?admin=updated`

  try {
    const session = await requireAdminSession()
    const input = await parseAdminPerkForm(formData)

    if (!perkStatuses.includes(input.status)) {
      throw new Error('Status is invalid')
    }

    await updateAdminPerk({
      id,
      input,
      actorTelegramId: session.telegramUserId,
      actorName: session.name ?? session.username ?? null,
    })
    revalidatePerkPaths(id)
  } catch (error) {
    redirectTo = `/admin/perks/${id}?admin_error=${encodeURIComponent(parseFormError(error))}`
  }

  redirect(redirectTo)
}

function requiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${key} is required`)
  }

  return value.trim()
}

function optionalFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key)

  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  return value.trim()
}

function revalidatePerkPaths(id: string) {
  revalidatePath('/perks')
  revalidatePath('/admin/perks')
  revalidatePath(`/admin/perks/${id}`)
  revalidatePath(`/perks/claim/${id}`)
}

function isStatusAction(value: string): value is StatusAction {
  return ['approved', 'rejected', 'paused', 'archived'].includes(value)
}
