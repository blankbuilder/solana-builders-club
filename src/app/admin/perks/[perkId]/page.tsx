import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updatePerkAction } from '@/app/admin/perks/actions'
import { getAdminAuth } from '@/lib/admin'
import { getPerk, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import type { PerkStatus } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Perk',
  description: 'Edit a Solana Builders Club partner perk.',
}

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  params: Promise<{
    perkId: string
  }>
  searchParams: Promise<SearchParams>
}

export default async function EditPerkPage({ params, searchParams }: PageProps) {
  const [{ perkId }, resolvedSearchParams, auth] = await Promise.all([
    params,
    searchParams,
    getAdminAuth(),
  ])
  const adminMessage = firstParam(resolvedSearchParams.admin)
  const adminError = firstParam(resolvedSearchParams.admin_error)

  if (auth.status !== 'authorized') {
    return (
      <Shell>
        <div className="border border-[--color-warning] p-4 text-sm text-[--color-warning]">
          Admin access is required.
        </div>
      </Shell>
    )
  }

  if (!isPerksDatabaseConfigured()) {
    return (
      <Shell>
        <div className="border border-[--color-warning] p-4 text-sm text-[--color-warning]">
          `DATABASE_URL` is required before perks can be edited.
        </div>
      </Shell>
    )
  }

  const perk = await getPerk(perkId)

  if (!perk) {
    notFound()
  }

  return (
    <Shell>
      {adminMessage && (
        <div className="mb-6 border border-[--color-accent-secondary] p-4 text-sm text-[--color-accent-secondary]">
          Perk updated.
        </div>
      )}
      {adminError && (
        <div className="mb-6 border border-[--color-warning] p-4 text-sm text-[--color-warning]">
          {adminError}
        </div>
      )}
      <form
        action={updatePerkAction}
        className="grid gap-5 border border-[--color-border] bg-[--color-surface] p-5 md:p-6"
        encType="multipart/form-data"
      >
        <input name="id" type="hidden" value={perk.id} />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Telegram username" name="telegramUsername" defaultValue={perk.telegramUsername} required />
          <Field label="Project name" name="projectName" defaultValue={perk.projectName} required />
        </div>
        <Field label="Project website" name="projectWebsite" type="url" defaultValue={perk.projectWebsite} required />
        <TextArea label="Project description" name="projectDescription" rows={5} defaultValue={perk.projectDescription} required />
        <LogoField value={perk.logoDataUrl} />
        <Field label="Offer title" name="offerTitle" defaultValue={perk.offerTitle} required />
        <TextArea label="Offer terms" name="offerTerms" rows={5} defaultValue={perk.offerTerms} required />
        <Field label="Offer code" name="offerCode" defaultValue={perk.offerCode ?? ''} />
        <div className="grid gap-5 md:grid-cols-3">
          <Select
            label="Status"
            name="status"
            required
            value={perk.status}
            options={[
              ['submitted', 'Submitted'],
              ['approved', 'Approved'],
              ['rejected', 'Rejected'],
              ['paused', 'Paused'],
              ['archived', 'Archived'],
            ]}
          />
          <label className="flex items-center gap-3 pt-7 text-sm text-[--color-subtle]">
            <input name="featured" type="checkbox" defaultChecked={perk.featured} />
            Featured
          </label>
        </div>
        <TextArea label="Rejection reason" name="rejectionReason" rows={3} defaultValue={perk.rejectionReason ?? ''} />
        <button
          type="submit"
          className="mt-2 inline-flex w-fit cursor-pointer items-center justify-center border border-[--color-border] px-4 py-2 text-sm text-[--color-foreground] transition-colors hover:border-[--color-foreground]"
        >
          Save changes
        </button>
      </form>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className="mb-12 flex items-center justify-between gap-6">
        <Link
          href="/admin"
          className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
        >
          Admin
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/perks"
            className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
          >
            Public perks
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">Admin</p>
        <h1
          className="mb-8 text-3xl leading-tight font-medium tracking-tight md:text-5xl"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Edit perk
        </h1>
        {children}
      </main>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  min,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  required?: boolean
  min?: string
}) {
  return (
    <label className="grid gap-2 text-sm text-[--color-subtle]">
      <FieldLabel label={label} required={required} />
      <input
        className="border border-[--color-border] bg-black px-3 py-2 text-sm text-[--color-foreground] outline-none transition-colors focus:border-[--color-muted]"
        defaultValue={defaultValue}
        min={min}
        name={name}
        required={required}
        type={type}
      />
    </label>
  )
}

function TextArea({
  label,
  name,
  rows,
  defaultValue,
  required,
}: {
  label: string
  name: string
  rows: number
  defaultValue?: string
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm text-[--color-subtle]">
      <FieldLabel label={label} required={required} />
      <textarea
        className="resize-y border border-[--color-border] bg-black px-3 py-2 text-sm leading-relaxed text-[--color-foreground] outline-none transition-colors focus:border-[--color-muted]"
        defaultValue={defaultValue}
        name={name}
        required={required}
        rows={rows}
      />
    </label>
  )
}

function LogoField({ value }: { value: string }) {
  return (
    <div className="grid gap-3 text-sm text-[--color-subtle]">
      <span>Logo upload</span>
      <input name="existingLogoDataUrl" type="hidden" value={value} />
      {value && (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border border-[--color-border] bg-black">
            <img alt="" className="max-h-8 max-w-8 object-contain" src={value} />
          </div>
          <span className="text-xs text-[--color-muted]">Upload a new file to replace it.</span>
        </div>
      )}
      <input
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="border border-[--color-border] bg-black px-3 py-2 text-sm text-[--color-foreground] outline-none transition-colors file:mr-4 file:cursor-pointer file:border-0 file:bg-[--color-surface] file:px-3 file:py-1 file:text-sm file:text-[--color-foreground] focus:border-[--color-muted]"
        name="logo"
        type="file"
      />
      <span className="text-xs leading-relaxed text-[--color-muted]">
        PNG, JPEG, WebP, or SVG. Max 1 MB.
      </span>
    </div>
  )
}

function Select<T extends PerkStatus>({
  label,
  name,
  value,
  options,
  required,
}: {
  label: string
  name: string
  value: T
  options: Array<[T, string]>
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm text-[--color-subtle]">
      <FieldLabel label={label} required={required} />
      <select
        className="border border-[--color-border] bg-black px-3 py-2 text-sm text-[--color-foreground] outline-none transition-colors focus:border-[--color-muted]"
        defaultValue={value}
        name={name}
        required={required}
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span>
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-[--color-warning]">
          *
        </span>
      )}
    </span>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
