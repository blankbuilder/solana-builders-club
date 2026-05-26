import type { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/config'
import { getApprovedPerks, isPerksDatabaseConfigured } from '@/lib/perks/queries'
import { getCurrentTelegramSession } from '@/lib/telegram/session'
import type { Perk } from '@/types'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'

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
    <PageWrapper>
      <div className="w-full relative border-b-[0.5px] border-white/10 flex-1 flex flex-col">
        <SectionHeader current="01" total="01" title="PERKS" />
        
        <div className="px-6 py-12 md:py-16 mx-auto w-full flex-1">
          <section className="mb-12 grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="animate-fade-in">
              <div className="mb-8 flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase text-[--color-subtle]">
                <span className="text-[--color-accent-secondary]">Ecosystem</span>
                <span className="text-white/20">//</span>
                <span>Member Deals</span>
                <span className="text-white/20">//</span>
              </div>
              <h1
                className="mb-6 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl lg:text-6xl"
              >
                Partner benefits for verified <span className="border-b border-dashed border-white/20 pb-1">SBC members</span>.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[--color-subtle] animate-fade-in delay-100">
                Connect Telegram to verify community membership and unlock claim links as partner
                offers go live.
              </p>
            </div>

            <aside className="border-[0.5px] border-white/10 bg-[--color-bg] p-1 relative overflow-hidden group animate-fade-in delay-200">
              <div className="border-[0.5px] border-dashed border-white/10 p-6 h-full flex flex-col bg-[--color-surface]/50 transition-colors group-hover:bg-[--color-surface]">
                <div className="mb-6 flex items-start justify-between border-b-[0.5px] border-white/10 pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold tracking-tight text-[--color-foreground]">ACCESS</span>
                  </div>
                </div>
                
                {session ? (
                  <div>
                    <p className="mb-2 text-sm text-[--color-foreground] font-mono">
                      Connected as <span className="text-[--color-warning]">{session.name ?? session.username ?? `Telegram ${session.telegramUserId}`}</span>
                    </p>
                    <p className="mb-6 text-xs leading-relaxed text-[--color-subtle] font-mono">
                      Membership verified on {formatDate(session.verifiedAt)}.
                    </p>
                    <a href="/api/telegram/logout" className="btn-secondary corner-brackets inline-flex text-xs">
                      Disconnect Telegram
                    </a>
                  </div>
                ) : (
                  <div>
                    <p className="mb-6 text-sm leading-relaxed text-[--color-subtle]">
                      Telegram membership verification is required before private claim links are
                      revealed.
                    </p>
                    <a
                      href={`/api/telegram/start?returnTo=${encodeURIComponent('/perks')}`}
                      className="btn-primary corner-brackets inline-flex"
                    >
                      Connect Telegram
                    </a>
                  </div>
                )}
              </div>
            </aside>
          </section>

          {(messageKey || errorKey) && (
            <div
              className={`mb-12 border-[0.5px] p-4 text-sm font-mono ${
                errorKey
                  ? 'border-[--color-warning] text-[--color-warning] bg-[--color-warning]/10'
                  : 'border-[--color-accent-secondary] text-[--color-accent-secondary] bg-[--color-accent-secondary]/10'
              }`}
            >
              {errorKey
                ? telegramErrors[errorKey] ?? 'Telegram login failed.'
                : telegramMessages[messageKey ?? ''] ?? 'Telegram connected.'}
            </div>
          )}

          {!isPerksDatabaseConfigured() ? (
            <div className="border-[0.5px] border-[--color-warning] p-4 text-sm font-mono text-[--color-warning] bg-[--color-warning]/10">
              `DATABASE_URL` is required before perks can be listed.
            </div>
          ) : perks.length === 0 ? (
            <div className="border-[0.5px] border-white/10 bg-[--color-surface] p-6 text-sm leading-relaxed text-[--color-subtle] font-mono text-center">
              Partner perks are being reviewed. Approved offers will appear here.
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {perks.map((perk) => (
                <PerkCard key={perk.id} perk={perk} isVerified={Boolean(session)} />
              ))}
            </section>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

function PerkCard({ perk, isVerified }: { perk: Perk; isVerified: boolean }) {
  const terms = termsList(perk.offerTerms)

  return (
    <article className="flex min-h-[320px] flex-col border-[0.5px] border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 group transition-colors hover:border-white/20">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border-[0.5px] border-white/10 bg-[--color-bg]">
            {perk.logoDataUrl ? (
              <img src={perk.logoDataUrl} alt="" className="h-7 w-7 object-contain opacity-80 filter grayscale group-hover:grayscale-0 transition-all duration-500" />
            ) : (
              <span className="text-xs font-mono text-[--color-muted] group-hover:text-[--color-foreground] transition-colors">{initials(perk.projectName)}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-[--color-foreground] tracking-tight">{perk.projectName}</p>
            <a
              href={perk.projectWebsite}
              rel="noopener noreferrer"
              target="_blank"
              className="text-[10px] font-mono uppercase tracking-widest text-[--color-subtle] transition-colors hover:text-[--color-foreground]"
            >
              Project website
            </a>
          </div>
        </div>
        <span className="border-[0.5px] border-white/10 px-2 py-1 text-[9px] uppercase tracking-widest text-[--color-accent-secondary] bg-[--color-accent-secondary]/10">
          Available
        </span>
      </div>

      <h2 className="mb-4 text-xl font-semibold leading-snug text-[--color-foreground]">
        {perk.offerTitle}
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-[--color-subtle] flex-1">
        {perk.projectDescription}
      </p>

      <div className="mt-auto border-t-[0.5px] border-white/10 pt-5">
        <div className="mb-6 space-y-3">
          {terms.map((term, i) => (
            <p key={`${term}-${i}`} className="text-xs leading-relaxed text-[--color-muted] flex items-start gap-2">
              <span className="text-[--color-warning] mt-0.5 opacity-50">•</span>
              <span>{term}</span>
            </p>
          ))}
        </div>

        <a
          href={
            isVerified
              ? `/perks/claim/${perk.id}`
              : `/api/telegram/start?returnTo=${encodeURIComponent(`/perks/claim/${perk.id}`)}`
          }
          className="btn-secondary corner-brackets w-full text-center"
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
