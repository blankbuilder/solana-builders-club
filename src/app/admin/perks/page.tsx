import type { Metadata } from 'next'
import Link from 'next/link'
import {
  setPerkFeaturedAction,
  setPerkStatusAction,
} from '@/app/admin/perks/actions'
import { getAdminAuth } from '@/lib/admin'
import { getAdminPerks, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import type { Perk, PerkStatus } from '@/types'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'

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
    <PageWrapper>
      <div className="w-full relative border-b-[0.5px] border-white/10 flex-1 flex flex-col">
        <SectionHeader current="ADMIN" title="PERK MODERATION" />
        
        <div className="px-6 py-12 md:py-16 mx-auto w-full max-w-7xl flex-1">
          <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1
                className="mb-4 text-3xl leading-tight font-semibold tracking-tight md:text-5xl"
              >
                Perk moderation
              </h1>
              <p className="text-sm text-[--color-subtle] font-mono">
                Manage all partner perks submissions.
              </p>
            </div>
            
            <Link
              href="/partners/perks/new"
              className="btn-primary corner-brackets inline-flex text-xs"
            >
              Submit test perk
            </Link>
          </div>

          {auth.status !== 'authorized' ? (
            <AdminAccessState auth={auth} />
          ) : !isPerksDatabaseConfigured() ? (
            <Notice tone="warning">`DATABASE_URL` is required before perks can be managed.</Notice>
          ) : (
            <AdminPerksContent adminMessage={adminMessage} adminError={adminError} />
          )}
        </div>
      </div>
    </PageWrapper>
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

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(['submitted', 'approved', 'rejected', 'paused', 'archived'] satisfies PerkStatus[]).map(
          (status) => (
            <div key={status} className="border-[0.5px] border-white/10 bg-[--color-surface] p-4 flex flex-col justify-between min-h-[100px]">
              <p className="text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono">
                {status}
              </p>
              <p className="text-3xl text-[--color-foreground] font-semibold">{counts[status] ?? 0}</p>
            </div>
          )
        )}
      </div>

      {perks.length === 0 ? (
        <div className="border-[0.5px] border-white/10 bg-[--color-surface] p-6 text-sm text-[--color-subtle] font-mono text-center">
          No partner perks have been submitted yet.
        </div>
      ) : (
        <div className="overflow-x-auto border-[0.5px] border-white/10 bg-[--color-surface]">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-[0.5px] border-white/10 text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono bg-white/[0.02]">
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
                <tr key={perk.id} className="border-b-[0.5px] border-white/10 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 align-top">
                    <Link href={`/admin/perks/${perk.id}`} className="text-[--color-foreground] hover:text-[--color-subtle] transition-colors font-medium">
                      {perk.offerTitle}
                    </Link>
                    <p className="mt-2 text-xs text-[--color-muted] line-clamp-1 max-w-[200px]">{perk.offerTerms}</p>
                  </td>
                  <td className="p-4 text-[--color-subtle] align-top">
                    <p className="font-medium text-[--color-foreground]">{perk.projectName}</p>
                    <a href={perk.projectWebsite} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-[--color-muted] hover:text-[--color-subtle] transition-colors inline-block">{perk.projectWebsite}</a>
                  </td>
                  <td className="p-4 text-[--color-subtle] font-mono text-xs align-top">
                    {perk.telegramUsername}
                  </td>
                  <td className="p-4 align-top">
                    <span className={`border-[0.5px] px-2 py-1 text-[9px] uppercase tracking-widest font-mono ${
                      perk.status === 'approved' ? 'border-[--color-accent-secondary] text-[--color-accent-secondary] bg-[--color-accent-secondary]/10' :
                      perk.status === 'submitted' ? 'border-[--color-warning] text-[--color-warning] bg-[--color-warning]/10' :
                      'border-white/20 text-[--color-subtle]'
                    }`}>
                      {perk.status}
                    </span>
                  </td>
                  <td className="p-4 text-[--color-subtle] font-mono text-xs align-top">{perk.featured ? 'Yes' : 'No'}</td>
                  <td className="p-4 text-[--color-subtle] font-mono text-xs align-top whitespace-nowrap">{formatDate(perk.createdAt)}</td>
                  <td className="p-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <StatusButton perk={perk} status="approved" label="Approve" />
                      <StatusButton perk={perk} status="rejected" label="Reject" />
                      <StatusButton perk={perk} status="paused" label="Pause" />
                      <StatusButton perk={perk} status="archived" label="Archive" />
                      <form action={setPerkFeaturedAction}>
                        <input name="id" type="hidden" value={perk.id} />
                        <input name="featured" type="hidden" value={String(!perk.featured)} />
                        <button className="border-[0.5px] border-white/20 bg-[--color-bg] px-2 py-1 text-[10px] uppercase tracking-widest text-[--color-subtle] transition-colors hover:border-white/50 hover:text-[--color-foreground] font-mono">
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
        className="border-[0.5px] border-white/20 bg-[--color-bg] px-2 py-1 text-[10px] uppercase tracking-widest text-[--color-subtle] transition-colors hover:border-white/50 hover:text-[--color-foreground] disabled:cursor-not-allowed disabled:opacity-40 font-mono"
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
      <div className="border-[0.5px] border-white/10 bg-[--color-surface] p-6 max-w-md">
        <p className="mb-6 text-sm leading-relaxed text-[--color-subtle]">
          Telegram admin verification is required.
        </p>
        <a
          href={`/api/telegram/start?returnTo=${encodeURIComponent('/admin/perks')}`}
          className="btn-primary corner-brackets inline-flex"
        >
          Connect Telegram
        </a>
      </div>
    )
  }

  if (auth.status === 'forbidden') {
    return (
      <Notice tone="warning">
        Telegram ID <span className="text-white">{auth.session.telegramUserId}</span> is verified but not in `ADMIN_TELEGRAM_IDS`.
      </Notice>
    )
  }

  return <Notice tone="warning">`ADMIN_TELEGRAM_IDS` is required before admin access works.</Notice>
}

function Notice({ children, tone }: { children: React.ReactNode; tone: 'success' | 'warning' }) {
  return (
    <div
      className={`mb-8 border-[0.5px] p-4 text-sm font-mono inline-block ${
        tone === 'success'
          ? 'border-[--color-accent-secondary] text-[--color-accent-secondary] bg-[--color-accent-secondary]/10'
          : 'border-[--color-warning] text-[--color-warning] bg-[--color-warning]/10'
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
