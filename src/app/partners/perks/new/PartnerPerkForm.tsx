'use client'

import { useActionState } from 'react'
import { ImageUploadPreview } from '@/components/ImageUploadPreview'
import { submitPartnerPerk, type PartnerPerkFormState } from '@/app/partners/perks/new/actions'

const initialState: PartnerPerkFormState = {}

const fieldErrorClasses = 'mt-1 text-xs font-mono text-[--color-warning]'
const inputBaseClasses =
  'w-full border-[0.5px] bg-[--color-bg] p-3 text-sm focus:outline-none transition-colors'

function inputClasses(hasError: boolean): string {
  return `${inputBaseClasses} ${
    hasError
      ? 'border-[--color-warning] focus:border-[--color-warning]'
      : 'border-white/20 focus:border-white/50'
  }`
}

export function PartnerPerkForm() {
  const [state, formAction, pending] = useActionState(submitPartnerPerk, initialState)
  const errors = state.errors ?? {}

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {state.formError && (
        <div
          role="alert"
          className="border-[0.5px] border-[--color-warning] p-4 text-sm font-mono text-[--color-warning] bg-[--color-warning]/10"
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
        <ImageUploadPreview name="logo" required={true} />
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

      <div className="grid gap-2 border-t-[0.5px] border-white/10 pt-6 mt-2">
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

      <div className="mt-6 border-t-[0.5px] border-white/10 pt-6">
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
