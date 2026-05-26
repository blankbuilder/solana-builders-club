import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import AdminHeaderLink from '@/components/AdminHeaderLink'
import { getApprovedPerk } from '@/lib/perks/queries'
import { getCurrentTelegramSession } from '@/lib/telegram/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Claim Perk',
  description: 'Claim a Solana Builders Club member perk.',
}

interface PageProps {
  params: Promise<{
    perkId: string
  }>
}

export default async function ClaimPerkPage({ params }: PageProps) {
  const { perkId } = await params
  const session = await getCurrentTelegramSession()

  if (!session) {
    redirect(`/api/telegram/start?returnTo=${encodeURIComponent(`/perks/claim/${perkId}`)}`)
  }

  const perk = await getApprovedPerk(perkId)

  if (!perk) {
    notFound()
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className="mb-16 flex items-center justify-between gap-6">
        <Link
          href="/perks"
          className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
        >
          Perks
        </Link>
        <div className="flex items-center gap-6">
          <AdminHeaderLink />
          <a href="/api/telegram/logout" className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs">
            Disconnect
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">
            {perk.projectName}
          </p>
          <h1
            className="mb-6 text-3xl leading-tight font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {perk.offerTitle}
          </h1>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[--color-subtle]">
            {perk.projectDescription}
          </p>
          <p className="mb-4 whitespace-pre-line border-l border-[--color-accent-secondary] pl-3 text-sm text-[--color-foreground]">
            {perk.offerTerms}
          </p>
          <a
            href={perk.projectWebsite}
            rel="noopener noreferrer"
            target="_blank"
            className="cta-link text-sm"
          >
            Visit project
          </a>
        </section>

        <aside className="border border-[--color-border] bg-[--color-surface] p-5">
          <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">
            Claim
          </p>
          {perk.offerCode ? (
            <div className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-widest text-[--color-muted]">
                Code
              </p>
              <code className="block border border-[--color-border] bg-black p-3 text-sm text-[--color-foreground]">
                {perk.offerCode}
              </code>
            </div>
          ) : (
            <p className="mb-5 text-sm leading-relaxed text-[--color-subtle]">
              This perk does not have a public code. Contact the SBC team if you need help
              redeeming it.
            </p>
          )}
          <p className="text-xs leading-relaxed text-[--color-muted]">
            Verified as {session.name ?? session.username ?? `Telegram ${session.telegramUserId}`}.
          </p>
        </aside>
      </main>
    </div>
  )
}
