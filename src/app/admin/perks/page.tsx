import type { Metadata } from 'next'
import Link from 'next/link'
import {
  setPerkFeaturedAction,
  setPerkStatusAction,
} from '@/app/admin/perks/actions'
import { getAdminAuth } from '@/lib/admin'
import { getAdminPerks, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import type { Perk, PerkStatus } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Perks',
  description: 'Manage Solana Builders Club partner perks.',
  alternates: {
    canonical: '/admin/perks',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function AdminPerksPage({ searchParams }: PageProps) {
  const [params, auth] = await Promise.all([searchParams, getAdminAuth()])
  const adminMessage = firstParam(params.admin)
  const adminError = firstParam(params.admin_error)

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
            href="/partners/perks/new"
            className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
          >
            Partner form
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl">
        <section className="mb-10">
          <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">
            Admin
          </p>
          <h1
            className="mb-4 text-3xl leading-tight font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            Perk moderation
          </h1>
        </section>

        {auth.status !== 'authorized' ? (
          <AdminAccessState auth={auth} />
        ) : !isPerksDatabaseConfigured() ? (
          <Notice tone="warning">`DATABASE_URL` is required before perks can be managed.</Notice>
        ) : (
          <AdminPerksContent adminMessage={adminMessage} adminError={adminError} />
        )}
      </main>
    </div>
  )
}

async function AdminPerksContent({
  adminMessage,
  adminError,
}: {
  adminMessage?: string
  adminError?: string
}) {
  const perks = await getAdminPerks()
  const counts = countByStatus(perks)

  return (
    <>
      {adminMessage && <Notice tone="success">Perk updated.</Notice>}
      {adminError && <Notice tone="warning">{adminError}</Notice>}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(['submitted', 'approved', 'rejected', 'paused', 'archived'] satisfies PerkStatus[]).map(
          (status) => (
            <div key={status} className="border border-[--color-border] bg-[--color-surface] p-4">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-[--color-muted]">
                {status}
              </p>
              <p className="text-2xl text-[--color-foreground]">{counts[status] ?? 0}</p>
            </div>
          )
        )}
      </div>

      {perks.length === 0 ? (
        <div className="border border-[--color-border] bg-[--color-surface] p-6 text-sm text-[--color-subtle]">
          No partner perks have been submitted yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[--color-border] bg-[--color-surface]">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[--color-border] text-xs uppercase tracking-widest text-[--color-muted]">
                <th className="p-4 font-normal">Perk</th>
                <th className="p-4 font-normal">Project</th>
                <th className="p-4 font-normal">Contact</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Featured</th>
                <th className="p-4 font-normal">Submitted</th>
                <th className="p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {perks.map((perk) => (
                <tr key={perk.id} className="border-b border-[--color-border] last:border-b-0">
                  <td className="p-4">
                    <Link href={`/admin/perks/${perk.id}`} className="text-[--color-foreground] underline">
                      {perk.offerTitle}
                    </Link>
                    <p className="mt-1 text-xs text-[--color-muted]">{perk.offerTerms}</p>
                  </td>
                  <td className="p-4 text-[--color-subtle]">
                    <p>{perk.projectName}</p>
                    <p className="mt-1 text-xs text-[--color-muted]">{perk.projectWebsite}</p>
                  </td>
                  <td className="p-4 text-[--color-subtle]">
                    {perk.telegramUsername}
                  </td>
                  <td className="p-4">
                    <span className="border border-[--color-border] px-2 py-1 text-[10px] uppercase tracking-widest text-[--color-muted]">
                      {perk.status}
                    </span>
                  </td>
                  <td className="p-4 text-[--color-subtle]">{perk.featured ? 'Yes' : 'No'}</td>
                  <td className="p-4 text-[--color-subtle]">{formatDate(perk.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <StatusButton perk={perk} status="approved" label="Approve" />
                      <StatusButton perk={perk} status="rejected" label="Reject" />
                      <StatusButton perk={perk} status="paused" label="Pause" />
                      <StatusButton perk={perk} status="archived" label="Archive" />
                      <form action={setPerkFeaturedAction}>
                        <input name="id" type="hidden" value={perk.id} />
                        <input name="featured" type="hidden" value={String(!perk.featured)} />
                        <button className="border border-[--color-border] px-2 py-1 text-xs text-[--color-subtle] transition-colors hover:border-[--color-foreground] hover:text-[--color-foreground]">
                          {perk.featured ? 'Unfeature' : 'Feature'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function StatusButton({
  perk,
  status,
  label,
}: {
  perk: Perk
  status: 'approved' | 'rejected' | 'paused' | 'archived'
  label: string
}) {
  return (
    <form action={setPerkStatusAction}>
      <input name="id" type="hidden" value={perk.id} />
      <input name="status" type="hidden" value={status} />
      <button
        className="border border-[--color-border] px-2 py-1 text-xs text-[--color-subtle] transition-colors hover:border-[--color-foreground] hover:text-[--color-foreground] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={perk.status === status}
      >
        {label}
      </button>
    </form>
  )
}

function AdminAccessState({ auth }: { auth: Awaited<ReturnType<typeof getAdminAuth>> }) {
  if (auth.status === 'anonymous') {
    return (
      <div className="border border-[--color-border] bg-[--color-surface] p-6">
        <p className="mb-5 text-sm leading-relaxed text-[--color-subtle]">
          Telegram admin verification is required.
        </p>
        <a
          href={`/api/telegram/start?returnTo=${encodeURIComponent('/admin/perks')}`}
          className="inline-flex items-center justify-center border border-[--color-border] px-4 py-2 text-sm text-[--color-foreground] transition-colors hover:border-[--color-foreground]"
        >
          Connect Telegram
        </a>
      </div>
    )
  }

  if (auth.status === 'forbidden') {
    return (
      <Notice tone="warning">
        Telegram ID {auth.session.telegramUserId} is verified but not in `ADMIN_TELEGRAM_IDS`.
      </Notice>
    )
  }

  return <Notice tone="warning">`ADMIN_TELEGRAM_IDS` is required before admin access works.</Notice>
}

function Notice({ children, tone }: { children: React.ReactNode; tone: 'success' | 'warning' }) {
  return (
    <div
      className={`mb-6 border p-4 text-sm ${
        tone === 'success'
          ? 'border-[--color-accent-secondary] text-[--color-accent-secondary]'
          : 'border-[--color-warning] text-[--color-warning]'
      }`}
    >
      {children}
    </div>
  )
}

function countByStatus(perks: Perk[]): Partial<Record<PerkStatus, number>> {
  return perks.reduce<Partial<Record<PerkStatus, number>>>((counts, perk) => {
    counts[perk.status] = (counts[perk.status] ?? 0) + 1
    return counts
  }, {})
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
