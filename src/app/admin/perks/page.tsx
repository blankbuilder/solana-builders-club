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
      <div className="w-full relative border-b-[0.5px] border-white/20 flex-1 flex flex-col">
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
  const pendingPerks = perks.filter((perk) => perk.status === 'submitted')
  const processedPerks = perks.filter((perk) => perk.status !== 'submitted')

  return (
    <>
      {adminMessage && <Notice tone="success">Perk updated.</Notice>}
      {adminError && <Notice tone="warning">{adminError}</Notice>}

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(['submitted', 'approved', 'rejected', 'paused', 'archived'] satisfies PerkStatus[]).map(
          (status) => (
            <div key={status} className="border-[0.5px] border-white/20 bg-[--color-surface] p-4 flex flex-col justify-between min-h-[100px]">
              <p className="text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono">
                {status}
              </p>
              <p className="text-3xl text-[--color-foreground] font-semibold">{counts[status] ?? 0}</p>
            </div>
          )
        )}
      </div>

      {perks.length === 0 ? (
        <div className="border-[0.5px] border-white/20 bg-[--color-surface] p-6 text-sm text-[--color-subtle] font-mono text-center">
          No partner perks have been submitted yet.
        </div>
      ) : (
        <>
          {pendingPerks.length > 0 && (
            <section className="mb-12">
              <div className="mb-6 flex items-baseline justify-between gap-4 border-b-[0.5px] border-white/20 pb-4">
                <h2 className="text-[11px] uppercase tracking-widest text-[--color-warning] font-mono">
                  Pending review &mdash; {pendingPerks.length}
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-[--color-muted] font-mono">
                  Full submission details
                </p>
              </div>
              <div className="grid gap-6">
                {pendingPerks.map((perk) => (
                  <PendingPerkCard key={perk.id} perk={perk} />
                ))}
              </div>
            </section>
          )}

          {processedPerks.length > 0 && (
            <section>
              {pendingPerks.length > 0 && (
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b-[0.5px] border-white/20 pb-4">
                  <h2 className="text-[11px] uppercase tracking-widest text-[--color-subtle] font-mono">
                    Processed &mdash; {processedPerks.length}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-[--color-muted] font-mono">
                    Approved, rejected, paused, archived
                  </p>
                </div>
              )}
              <div className="border-[0.5px] border-white/20 bg-[--color-surface] divide-y divide-white/[0.15]">
                {processedPerks.map((perk) => (
                  <div key={perk.id} className="group relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,2.5fr)_minmax(0,1fr)_auto] items-center gap-x-8 gap-y-6 px-6 py-6 hover:bg-white/[0.02] transition-colors">
                    
                    {/* Status badge on border */}
                    <div className="absolute top-0 right-6 -translate-y-1/2 z-10">
                      <StatusBadge status={perk.status} />
                    </div>

                    {/* Identity: logo + project + URL */}
                    <div className="flex items-center gap-4 min-w-0">
                      {perk.logoDataUrl ? (
                        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden border-[0.5px] border-white/20 bg-[--color-bg] p-1.5 rounded-sm">
                          <img
                            src={perk.logoDataUrl}
                            alt={`${perk.projectName} logo`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[0.5px] border-white/20 bg-[--color-bg] text-[9px] uppercase tracking-widest text-[--color-muted] font-mono rounded-sm">
                          N/A
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[--color-foreground] text-sm leading-none truncate">{perk.projectName}</p>
                          {perk.featured && (
                            <span className="text-[--color-accent] text-xs leading-none" title="Featured">★</span>
                          )}
                        </div>
                        <a href={perk.projectWebsite} target="_blank" rel="noopener noreferrer" className="mt-1.5 text-[11px] text-[--color-subtle] hover:text-[--color-foreground] transition-colors block font-mono truncate">
                          {perk.projectWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    </div>

                    {/* Perk title + terms */}
                    <div className="min-w-0 flex flex-col justify-center">
                      <Link href={`/admin/perks/${perk.id}`} className="text-[--color-foreground] hover:text-[--color-subtle] transition-colors font-semibold text-sm leading-tight block truncate">
                        {perk.offerTitle}
                      </Link>
                      <p className="mt-1.5 text-xs text-[--color-muted] leading-relaxed line-clamp-2">{perk.offerTerms}</p>
                    </div>

                    {/* Meta column: contact + date */}
                    <div className="flex flex-col items-start min-w-0 text-[11px] font-mono">
                      <div className="flex flex-col gap-0.5 text-[--color-subtle]">
                        <a href={`https://t.me/${perk.telegramUsername.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[--color-foreground] transition-colors truncate">
                          {perk.telegramUsername}
                        </a>
                        <span className="text-[--color-muted] whitespace-nowrap">{formatDate(perk.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2 lg:ml-auto">
                      <FeatureButton perk={perk} />
                      <StatusButton perk={perk} status="approved" label="Approve" />
                      <StatusButton perk={perk} status="rejected" label="Reject" />
                      <StatusButton perk={perk} status="paused" label="Pause" />
                      <StatusButton perk={perk} status="archived" label="Archive" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}

function PendingPerkCard({ perk }: { perk: Perk }) {
  return (
    <article className="border-[0.5px] border-white/20 bg-[--color-surface]">
      <header className="flex items-center gap-4 border-b-[0.5px] border-white/20 px-5 py-3">
        {perk.logoDataUrl ? (
          <img
            src={perk.logoDataUrl}
            alt={`${perk.projectName} logo`}
            className="h-10 w-10 flex-shrink-0 border-[0.5px] border-white/20 bg-[--color-bg] object-contain p-1"
          />
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-[0.5px] border-white/20 bg-[--color-bg] text-[8px] uppercase tracking-widest text-[--color-muted] font-mono">
            N/A
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="truncate text-base font-semibold tracking-tight text-[--color-foreground]">
              {perk.projectName}
            </h3>
            <StatusBadge status={perk.status} />
            {perk.featured && (
              <span className="border-[0.5px] border-[--color-accent] bg-[--color-accent]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-[--color-accent] font-mono">
                Featured
              </span>
            )}
          </div>
          <a
            href={perk.projectWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate text-[11px] text-[--color-muted] hover:text-[--color-subtle] transition-colors font-mono"
          >
            {perk.projectWebsite}
          </a>
        </div>
        <div className="flex-shrink-0 text-right text-[11px] text-[--color-subtle] font-mono leading-snug">
          <p>{perk.telegramUsername}</p>
          <p className="text-[--color-muted]">{formatDate(perk.createdAt)}</p>
        </div>
      </header>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        <DetailBlock label="Project description">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[--color-subtle]">
            {perk.projectDescription}
          </p>
        </DetailBlock>

        <DetailBlock label="Offer">
          <p className="text-sm font-semibold text-[--color-foreground]">{perk.offerTitle}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[--color-subtle]">
            {perk.offerTerms}
          </p>
          {perk.offerCode && (
            <div className="mt-4 inline-flex items-center gap-2 border-[0.5px] border-white/20 bg-[--color-bg] px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-[--color-muted] font-mono">Code</span>
              <code className="text-sm text-[--color-foreground] font-mono">{perk.offerCode}</code>
            </div>
          )}
        </DetailBlock>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t-[0.5px] border-white/20 p-6">
        <div className="flex flex-wrap gap-2">
          <StatusButton perk={perk} status="approved" label="Approve" />
          <StatusButton perk={perk} status="rejected" label="Reject" />
          <StatusButton perk={perk} status="paused" label="Pause" />
          <StatusButton perk={perk} status="archived" label="Archive" />
          <FeatureButton perk={perk} />
        </div>
        <Link
          href={`/admin/perks/${perk.id}`}
          className="text-[10px] uppercase tracking-widest text-[--color-subtle] hover:text-[--color-foreground] transition-colors font-mono"
        >
          Edit details -&gt;
        </Link>
      </footer>
    </article>
  )
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[10px] uppercase tracking-widest text-[--color-muted] font-mono">
        {label}
      </p>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: PerkStatus }) {
  const className =
    status === 'approved'
      ? 'border-transparent bg-white text-black font-semibold'
      : status === 'submitted'
        ? 'border-transparent bg-[--color-warning] text-black font-semibold'
        : status === 'rejected'
          ? 'border-transparent bg-[--color-error] text-white font-semibold'
          : 'border-transparent bg-white/20 text-white font-semibold'

  return (
    <span className={`border-[0.5px] px-2.5 py-1 text-[9px] uppercase tracking-widest font-mono rounded-sm ${className}`}>
      {status}
    </span>
  )
}

function FeatureButton({ perk }: { perk: Perk }) {
  return (
    <form action={setPerkFeaturedAction}>
      <input name="id" type="hidden" value={perk.id} />
      <input name="featured" type="hidden" value={String(!perk.featured)} />
      <button className={`cursor-pointer border-[0.5px] px-2.5 py-1.5 text-[9px] uppercase tracking-widest transition-colors font-mono rounded-sm ${perk.featured ? 'border-[--color-accent] text-[--color-accent] bg-[--color-accent]/10 hover:bg-[--color-accent]/20' : 'border-white/20 bg-transparent text-[--color-subtle] hover:border-white/40 hover:text-[--color-foreground] hover:bg-white/[0.02]'}`}>
        {perk.featured ? '★ Featured' : 'Feature'}
      </button>
    </form>
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
  if (perk.status === status) return null

  return (
    <form action={setPerkStatusAction}>
      <input name="id" type="hidden" value={perk.id} />
      <input name="status" type="hidden" value={status} />
      <button
        className="cursor-pointer border-[0.5px] border-white/20 bg-transparent px-2.5 py-1.5 text-[9px] uppercase tracking-widest text-[--color-subtle] transition-colors hover:border-white/40 hover:text-[--color-foreground] hover:bg-white/[0.02] font-mono rounded-sm"
      >
        {label}
      </button>
    </form>
  )
}

function AdminAccessState({ auth }: { auth: Awaited<ReturnType<typeof getAdminAuth>> }) {
  if (auth.status === 'anonymous') {
    return (
      <div className="border-[0.5px] border-white/20 bg-[--color-surface] p-6 max-w-md">
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
