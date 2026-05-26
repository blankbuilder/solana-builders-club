'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { ImageUploadPreview } from '@/components/ImageUploadPreview'
import { submitPartnerPerk, type PartnerPerkFormState } from '@/app/partners/perks/new/actions'

const initialState: PartnerPerkFormState = {}
const allowedLogoTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
const maxLogoBytes = 1_000_000

const fieldErrorClasses = 'mt-1 text-xs font-mono form-field-error'
const inputBaseClasses =
  'w-full border-[0.5px] bg-[--color-bg] p-3 text-sm focus:outline-none transition-colors'

function inputClasses(hasError: boolean): string {
  return `${inputBaseClasses} ${
    hasError
      ? 'form-control-error'
      : 'border-white/20 focus:border-white/50'
  }`
}

export function PartnerPerkForm() {
  const [state, setState] = useState<PartnerPerkFormState>(initialState)
  const [pending, startTransition] = useTransition()
  const errors = state.errors ?? {}
  const values = state.values ?? {}

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const clientErrors = validateClientForm(formData)

    if (Object.keys(clientErrors).length > 0) {
      setState((prevState) => ({ errors: clientErrors, values: prevState.values }))
      return
    }

    setState((prevState) => ({ values: prevState.values }))
    startTransition(async () => {
      const nextState = await submitPartnerPerk(state, formData)
      setState(nextState)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6" noValidate>
      {state.formError && (
        <div
          role="alert"
          className="form-alert-error border-[0.5px] p-4 text-sm font-mono"
        >
          {state.formError}
        </div>
      )}

      <div className="grid gap-2">
        <label htmlFor="projectName" className="text-sm font-medium text-[--color-foreground]">
          Project name *
        </label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          required
          placeholder="e.g. Helius"
          defaultValue={values.projectName ?? ''}
          aria-invalid={Boolean(errors.projectName)}
          aria-describedby={errors.projectName ? 'projectName-error' : undefined}
          className={inputClasses(Boolean(errors.projectName))}
        />
        {errors.projectName && (
          <p id="projectName-error" className={fieldErrorClasses}>
            {errors.projectName}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="projectWebsite" className="text-sm font-medium text-[--color-foreground]">
          Project website *
        </label>
        <input
          type="url"
          id="projectWebsite"
          name="projectWebsite"
          required
          placeholder="https://"
          defaultValue={values.projectWebsite ?? ''}
          aria-invalid={Boolean(errors.projectWebsite)}
          aria-describedby={errors.projectWebsite ? 'projectWebsite-error' : undefined}
          className={inputClasses(Boolean(errors.projectWebsite))}
        />
        {errors.projectWebsite && (
          <p id="projectWebsite-error" className={fieldErrorClasses}>
            {errors.projectWebsite}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="projectDescription" className="text-sm font-medium text-[--color-foreground]">
          Project description *
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          rows={3}
          placeholder="Describe what your project does..."
          defaultValue={values.projectDescription ?? ''}
          aria-invalid={Boolean(errors.projectDescription)}
          aria-describedby={errors.projectDescription ? 'projectDescription-error' : undefined}
          className={`${inputClasses(Boolean(errors.projectDescription))} resize-y`}
        />
        {errors.projectDescription && (
          <p id="projectDescription-error" className={fieldErrorClasses}>
            {errors.projectDescription}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="logo" className="text-sm font-medium text-[--color-foreground]">
          Project logo *
        </label>
        <ImageUploadPreview
          name="logo"
          required={true}
          existingUrl={values.logoDataUrl ?? null}
          existingFileName={values.logoFileName ?? null}
          hasError={Boolean(errors.logo)}
          describedBy={errors.logo ? 'logo-error' : undefined}
        />
        {errors.logo && (
          <p id="logo-error" className={fieldErrorClasses}>
            {errors.logo}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="offerTitle" className="text-sm font-medium text-[--color-foreground]">
          Offer title *
        </label>
        <input
          type="text"
          id="offerTitle"
          name="offerTitle"
          required
          placeholder="e.g. $100 in free credits"
          defaultValue={values.offerTitle ?? ''}
          aria-invalid={Boolean(errors.offerTitle)}
          aria-describedby={errors.offerTitle ? 'offerTitle-error' : undefined}
          className={inputClasses(Boolean(errors.offerTitle))}
        />
        {errors.offerTitle && (
          <p id="offerTitle-error" className={fieldErrorClasses}>
            {errors.offerTitle}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="offerTerms" className="text-sm font-medium text-[--color-foreground]">
          Offer details & Instructions *
        </label>
        <textarea
          id="offerTerms"
          name="offerTerms"
          required
          rows={4}
          placeholder="Describe the perk and instructions on how to claim..."
          defaultValue={values.offerTerms ?? ''}
          aria-invalid={Boolean(errors.offerTerms)}
          aria-describedby={errors.offerTerms ? 'offerTerms-error' : undefined}
          className={`${inputClasses(Boolean(errors.offerTerms))} resize-y`}
        />
        {errors.offerTerms && (
          <p id="offerTerms-error" className={fieldErrorClasses}>
            {errors.offerTerms}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="offerCode" className="text-sm font-medium text-[--color-foreground]">
          Offer code <span className="text-[--color-subtle] font-mono text-xs">(optional)</span>
        </label>
        <input
          type="text"
          id="offerCode"
          name="offerCode"
          placeholder="PROMO_CODE"
          defaultValue={values.offerCode ?? ''}
          aria-invalid={Boolean(errors.offerCode)}
          aria-describedby={errors.offerCode ? 'offerCode-error' : undefined}
          className={`${inputClasses(Boolean(errors.offerCode))} font-mono`}
        />
        {errors.offerCode && (
          <p id="offerCode-error" className={fieldErrorClasses}>
            {errors.offerCode}
          </p>
        )}
      </div>

      <div className="grid gap-2 border-t-[0.5px] border-white/20 pt-6 mt-2">
        <label htmlFor="telegramUsername" className="text-sm font-medium text-[--color-foreground]">
          Your Telegram username *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-[--color-subtle] font-mono">@</span>
          <input
            type="text"
            id="telegramUsername"
            name="telegramUsername"
            required
            placeholder="username"
            defaultValue={values.telegramUsername ?? ''}
            aria-invalid={Boolean(errors.telegramUsername)}
            aria-describedby={
              errors.telegramUsername ? 'telegramUsername-error' : 'telegramUsername-hint'
            }
            className={`${inputClasses(Boolean(errors.telegramUsername))} pl-8 font-mono`}
          />
        </div>
        {errors.telegramUsername ? (
          <p id="telegramUsername-error" className={fieldErrorClasses}>
            {errors.telegramUsername}
          </p>
        ) : (
          <p id="telegramUsername-hint" className="text-xs text-[--color-subtle] font-mono mt-1">
            So we can contact you if needed.
          </p>
        )}
      </div>

      <div className="mt-6 border-t-[0.5px] border-white/20 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary corner-brackets w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  )
}

function validateClientForm(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {}

  requiredText(errors, formData, 'projectName', 'Project name')
  requiredUrl(errors, formData, 'projectWebsite', 'Project website')
  requiredText(errors, formData, 'projectDescription', 'Project description')
  requiredLogo(errors, formData)
  requiredText(errors, formData, 'offerTitle', 'Offer title')
  requiredText(errors, formData, 'offerTerms', 'Offer terms')
  requiredTelegramUsername(errors, formData, 'telegramUsername', 'Telegram username')

  return errors
}

function requiredText(
  errors: Record<string, string>,
  formData: FormData,
  key: string,
  label: string
): string | null {
  const value = optionalText(formData, key)

  if (!value) {
    errors[key] = `${label} is required`
    return null
  }

  return value
}

function requiredUrl(
  errors: Record<string, string>,
  formData: FormData,
  key: string,
  label: string
) {
  const value = requiredText(errors, formData, key, label)

  if (!value) {
    return
  }

  try {
    const url = new URL(value)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error()
    }
  } catch {
    errors[key] = `${label} must be a valid URL`
  }
}

function requiredTelegramUsername(
  errors: Record<string, string>,
  formData: FormData,
  key: string,
  label: string
) {
  const value = requiredText(errors, formData, key, label)

  if (!value) {
    return
  }

  const normalized = value.startsWith('@') ? value : `@${value}`

  if (!/^@[A-Za-z0-9_]{5,32}$/.test(normalized)) {
    errors[key] =
      `${label} must be 5-32 characters and contain only letters, numbers, or underscores`
  }
}

function requiredLogo(errors: Record<string, string>, formData: FormData) {
  const logo = formData.get('logo')

  if (logo instanceof File && logo.size > 0) {
    if (!allowedLogoTypes.has(logo.type)) {
      errors.logo = 'Logo must be a PNG, JPEG, WebP, or SVG image'
    } else if (logo.size > maxLogoBytes) {
      errors.logo = 'Logo must be 1 MB or smaller'
    }
    return
  }

  if (!optionalText(formData, 'existingLogoDataUrl')) {
    errors.logo = 'Logo is required'
  }
}

function optionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key)

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : null
}
