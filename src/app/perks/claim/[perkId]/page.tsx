import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getApprovedPerks } from '@/lib/perks/queries'
import { getCurrentTelegramSession } from '@/lib/telegram/session'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Claim Perk',
  description: 'Claim a partner perk as a verified Solana Builders Club member.',
  robots: {
    index: false,
    follow: false,
  },
}

interface PageProps {
  params: Promise<{ perkId: string }>
}

export default async function ClaimPerkPage({ params }: PageProps) {
  const [{ perkId }, session, perks] = await Promise.all([
    params,
    getCurrentTelegramSession(),
    getApprovedPerks(),
  ])

  if (!session) {
    redirect('/perks')
  }

  const perk = perks.find((p) => p.id === perkId)

  if (!perk) {
    notFound()
  }

  return (
    <PageWrapper>
      <div className="w-full relative border-b-[0.5px] border-white/20 flex-1 flex flex-col">
        <SectionHeader current="01" total="01" title="CLAIM PERK" />
        
        <div className="px-6 py-12 md:py-16 mx-auto w-full max-w-5xl flex-1">
          <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
            <div>
              <Link href="/perks" className="text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono hover:text-[--color-foreground] transition-colors mb-4 inline-block">
                &lt;- Back to perks
              </Link>
              <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-5xl">
                Claim Perk
              </h1>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            <div className="animate-fade-in">
              <div className="mb-8 flex items-center gap-4 border-b-[0.5px] border-white/20 pb-8">
                {perk.logoDataUrl && (
                  <img
                    src={perk.logoDataUrl}
                    alt={`${perk.projectName} logo`}
                    className="h-16 w-16 bg-white/5 object-contain p-2 border-[0.5px] border-white/20"
                    loading="lazy"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[--color-foreground]">
                    {perk.projectName}
                  </h2>
                  <a
                    href={perk.projectWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-[--color-muted] hover:text-[--color-subtle] transition-colors block"
                  >
                    {perk.projectWebsite}
                  </a>
                </div>
              </div>

              <div className="mb-8 border-b-[0.5px] border-white/20 pb-8">
                <h3 className="text-sm font-bold tracking-tight uppercase font-mono mb-4 text-[--color-foreground]">Description</h3>
                <p className="text-base leading-relaxed text-[--color-subtle]">
                  {perk.projectDescription}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="mb-2 text-xl font-medium text-[--color-foreground]">
                  {perk.offerTitle}
                </h3>
                <div className="pt-4 text-sm leading-relaxed text-[--color-subtle] whitespace-pre-wrap">
                  {perk.offerTerms}
                </div>
              </div>
            </div>

            <aside className="border-[0.5px] border-white/20 bg-[--color-bg] p-1 relative overflow-hidden group animate-fade-in delay-100 h-fit">
              <div className="border-[0.5px] border-dashed border-white/20 p-6 flex flex-col bg-[--color-surface]/50 transition-colors group-hover:bg-[--color-surface]">
                <div className="mb-6 flex items-start justify-between border-b-[0.5px] border-white/20 pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold tracking-tight text-[--color-foreground]">CLAIM DETAILS</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {perk.offerCode && (
                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono">
                        Promo Code
                      </p>
                      <div className="border-[0.5px] border-[--color-warning] bg-[--color-warning]/10 p-3 font-mono text-sm text-[--color-warning] select-all cursor-copy">
                        {perk.offerCode}
                      </div>
                    </div>
                  )}

                  <div>
                    <a
                      href={perk.projectWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary corner-brackets w-full justify-center text-center block"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
