import type { Metadata } from 'next'
import Link from 'next/link'
import { submitPartnerPerk } from '@/app/partners/perks/new/actions'
import AdminHeaderLink from '@/components/AdminHeaderLink'
import { isPerksDatabaseConfigured } from '@/lib/perks/queries'

export const metadata: Metadata = {
  title: 'Submit a Partner Perk',
  description: 'Submit a partner perk for Solana Builders Club members.',
  alternates: {
    canonical: '/partners/perks/new',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function NewPartnerPerkPage({ searchParams }: PageProps) {
  const params = await searchParams
  const submitted = firstParam(params.submitted)
  const error = firstParam(params.error)
  const databaseConfigured = isPerksDatabaseConfigured()

  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className="mb-16 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
        >
          SBC
        </Link>
        <div className="flex items-center gap-6">
          <AdminHeaderLink />
          <Link
            href="/perks"
            className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
          >
            Perks
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[360px_1fr]">
        <section>
          <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">
            Partner submission
          </p>
          <h1
            className="mb-6 text-3xl leading-tight font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            Submit a perk for <span className="gradient-text">SBC members</span>.
          </h1>
          <p className="text-sm leading-relaxed text-[--color-subtle]">
            Share the project and offer details. We review submissions internally before anything
            appears on the member perks page.
          </p>
        </section>

        <section className="border border-[--color-border] bg-[--color-surface] p-5 md:p-6">
          {submitted && (
            <div className="mb-6 border border-[--color-accent-secondary] p-4 text-sm text-[--color-accent-secondary]">
              Thanks. The perk was submitted for review.
            </div>
          )}
          {error && (
            <div className="mb-6 border border-[--color-warning] p-4 text-sm text-[--color-warning]">
              {error === 'database'
                ? 'Perk submissions are not configured yet.'
                : error}
            </div>
          )}

          {!databaseConfigured ? (
            <p className="text-sm leading-relaxed text-[--color-subtle]">
              Perk submissions need `DATABASE_URL` before this form can accept entries.
            </p>
          ) : (
            <form action={submitPartnerPerk} className="grid gap-5" encType="multipart/form-data">
              <Field
                hint="Only visible to SBC admins so we can contact you."
                label="Telegram username"
                name="telegramUsername"
                placeholder="@username"
                required
              />
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Project name" name="projectName" required />
                <Field label="Project website" name="projectWebsite" type="url" required />
              </div>
              <TextArea label="Project description" name="projectDescription" rows={5} required />
              <FileField label="Logo upload" name="logo" required />
              <Field label="Offer title" name="offerTitle" required />
              <TextArea label="Offer terms" name="offerTerms" rows={5} required />
              <Field label="Offer code" name="offerCode" />
              <button
                type="submit"
                className="mt-2 inline-flex w-fit cursor-pointer items-center justify-center border border-[--color-border] px-4 py-2 text-sm text-[--color-foreground] transition-colors hover:border-[--color-foreground]"
              >
                Submit perk
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  min,
  hint,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  min?: string
  hint?: string
}) {
  return (
    <label className="grid gap-2 text-sm text-[--color-subtle]">
      <FieldLabel label={label} required={required} />
      <input
        className="border border-[--color-border] bg-black px-3 py-2 text-sm text-[--color-foreground] outline-none transition-colors focus:border-[--color-muted]"
        min={min}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {hint && <span className="text-xs leading-relaxed text-[--color-muted]">{hint}</span>}
    </label>
  )
}

function TextArea({
  label,
  name,
  rows,
  required,
}: {
  label: string
  name: string
  rows: number
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm text-[--color-subtle]">
      <FieldLabel label={label} required={required} />
      <textarea
        className="resize-y border border-[--color-border] bg-black px-3 py-2 text-sm leading-relaxed text-[--color-foreground] outline-none transition-colors focus:border-[--color-muted]"
        name={name}
        required={required}
        rows={rows}
      />
    </label>
  )
}

function FileField({
  label,
  name,
  required,
}: {
  label: string
  name: string
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm text-[--color-subtle]">
      <FieldLabel label={label} required={required} />
      <input
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="border border-[--color-border] bg-black px-3 py-2 text-sm text-[--color-foreground] outline-none transition-colors file:mr-4 file:cursor-pointer file:border-0 file:bg-[--color-surface] file:px-3 file:py-1 file:text-sm file:text-[--color-foreground] focus:border-[--color-muted]"
        name={name}
        required={required}
        type="file"
      />
      <span className="text-xs leading-relaxed text-[--color-muted]">
        PNG, JPEG, WebP, or SVG. Max 1 MB.
      </span>
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
