import type { Metadata } from 'next'
import Link from 'next/link'
import AdminHeaderLink from '@/components/AdminHeaderLink'
import { siteConfig } from '@/config'
import { getApprovedPerks, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import { getCurrentTelegramSession } from '@/lib/telegram/session'
import type { Perk } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Member Perks',
  description:
    'Partner perks for verified Solana Builders Club members, gated by Telegram community membership.',
  alternates: {
    canonical: '/perks',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  searchParams: Promise<SearchParams>
}

const telegramMessages: Record<string, string> = {
  connected: 'Telegram connected. Member-only claim links are unlocked.',
}

const telegramErrors: Record<string, string> = {
  config: 'Telegram login is not configured yet.',
  state: 'Telegram login expired. Try connecting again.',
  denied: 'Telegram login was not completed.',
  token: 'Telegram could not verify the login.',
  not_member: 'This Telegram account is not currently in the SBC community.',
  membership: 'Telegram membership could not be checked. Try again shortly.',
}

export default async function PerksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [session, perks] = await Promise.all([getCurrentTelegramSession(), getApprovedPerks()])
  const messageKey = firstParam(params.telegram)
  const errorKey = firstParam(params.telegram_error)

  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className="mb-16 flex items-center justify-between gap-6 animate-fade-in">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
        >
          SBC
        </Link>
        <div className="flex items-center gap-6">
          <AdminHeaderLink />
          <Link
            href="/partners/perks/new"
            className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
          >
            Submit perk
          </Link>
          <button
            data-tally-open={siteConfig.waitlistTallyId}
            data-tally-emoji-animation="wave"
            className="cursor-pointer border-0 bg-transparent text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
            type="button"
          >
            Join waitlist
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl">
        <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted] animate-fade-in">
              Member perks
            </p>
            <h1
              className="mb-6 max-w-3xl text-3xl leading-tight font-medium tracking-tight animate-fade-in delay-100 md:text-5xl"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              Partner benefits for verified <span className="gradient-text">SBC members</span>.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[--color-subtle] animate-fade-in delay-200">
              Connect Telegram to verify community membership and unlock claim links as partner
              offers go live.
            </p>
          </div>

          <aside className="border border-[--color-border] bg-[--color-surface] p-5 animate-fade-in delay-200">
            <p className="mb-3 text-xs uppercase tracking-widest text-[--color-muted]">
              Access
            </p>
            {session ? (
              <div>
                <p className="mb-2 text-sm text-[--color-foreground]">
                  Connected as {session.name ?? session.username ?? `Telegram ${session.telegramUserId}`}
                </p>
                <p className="mb-5 text-xs leading-relaxed text-[--color-subtle]">
                  Membership verified on {formatDate(session.verifiedAt)}.
                </p>
                <a href="/api/telegram/logout" className="cta-link text-sm">
                  Disconnect Telegram
                </a>
              </div>
            ) : (
              <div>
                <p className="mb-5 text-sm leading-relaxed text-[--color-subtle]">
                  Telegram membership verification is required before private claim links are
                  revealed.
                </p>
                <a
                  href={`/api/telegram/start?returnTo=${encodeURIComponent('/perks')}`}
                  className="inline-flex items-center justify-center border border-[--color-border] px-4 py-2 text-sm text-[--color-foreground] transition-colors hover:border-[--color-foreground]"
                >
                  Connect Telegram
                </a>
              </div>
            )}
          </aside>
        </section>

        {(messageKey || errorKey) && (
          <div
            className={`mb-8 border p-4 text-sm ${
              errorKey
                ? 'border-[--color-warning] text-[--color-warning]'
                : 'border-[--color-accent-secondary] text-[--color-accent-secondary]'
            }`}
          >
            {errorKey
              ? telegramErrors[errorKey] ?? 'Telegram login failed.'
              : telegramMessages[messageKey ?? ''] ?? 'Telegram connected.'}
          </div>
        )}

        {!isPerksDatabaseConfigured() ? (
          <div className="border border-[--color-warning] p-4 text-sm text-[--color-warning]">
            `DATABASE_URL` is required before perks can be listed.
          </div>
        ) : perks.length === 0 ? (
          <div className="border border-[--color-border] bg-[--color-surface] p-6 text-sm leading-relaxed text-[--color-subtle]">
            Partner perks are being reviewed. Approved offers will appear here.
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {perks.map((perk) => (
              <PerkCard key={perk.id} perk={perk} isVerified={Boolean(session)} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

function PerkCard({ perk, isVerified }: { perk: Perk; isVerified: boolean }) {
  const terms = termsList(perk.offerTerms)

  return (
    <article className="flex min-h-[320px] flex-col border border-[--color-border] bg-[--color-surface] p-5 transition-colors hover:border-[--color-muted]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[--color-border] bg-black">
            {perk.logoDataUrl ? (
              <img src={perk.logoDataUrl} alt="" className="h-6 w-6 object-contain opacity-80" />
            ) : (
              <span className="text-xs text-[--color-muted]">{initials(perk.projectName)}</span>
            )}
          </div>
          <div>
            <p className="text-sm text-[--color-foreground]">{perk.projectName}</p>
            <a
              href={perk.projectWebsite}
              rel="noopener noreferrer"
              target="_blank"
              className="text-xs text-[--color-muted] transition-colors hover:text-[--color-foreground]"
            >
              Project website
            </a>
          </div>
        </div>
        <span className="border border-[--color-border] px-2 py-1 text-[10px] uppercase tracking-widest text-[--color-muted]">
          Available
        </span>
      </div>

      <h2 className="mb-3 text-lg leading-snug font-medium text-[--color-foreground]">
        {perk.offerTitle}
      </h2>
      <p className="mb-5 text-sm leading-relaxed text-[--color-subtle]">
        {perk.projectDescription}
      </p>

      <div className="mt-auto">
        <div className="mb-5 space-y-2">
          {terms.map((term) => (
            <p key={term} className="text-xs leading-relaxed text-[--color-muted]">
              {term}
            </p>
          ))}
        </div>

        <a
          href={
            isVerified
              ? `/perks/claim/${perk.id}`
              : `/api/telegram/start?returnTo=${encodeURIComponent(`/perks/claim/${perk.id}`)}`
          }
          className="cta-link text-sm"
        >
          {isVerified ? 'Claim perk' : 'Connect Telegram'}
        </a>
      </div>
    </article>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function termsList(value: string): string[] {
  return value
    .split('\n')
    .map((term) => term.trim())
    .filter(Boolean)
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
