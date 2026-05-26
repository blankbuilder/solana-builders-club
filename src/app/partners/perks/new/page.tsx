import type { Metadata } from 'next'
import Link from 'next/link'
import { submitPartnerPerk } from '@/app/partners/perks/new/actions'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'
import { ImageUploadPreview } from '@/components/ImageUploadPreview'

export const metadata: Metadata = {
  title: 'Submit a Perk',
  description: 'Offer a perk to the Solana Builders Club community.',
  alternates: {
    canonical: '/partners/perks/new',
  },
}

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function NewPerkPage({ searchParams }: PageProps) {
  const params = await searchParams
  const success = firstParam(params.submitted) === '1'
  const error = firstParam(params.error)

  return (
    <PageWrapper>
      <div className="w-full relative border-b-[0.5px] border-white/10 flex-1 flex flex-col">
        <SectionHeader current="01" total="01" title="SUBMIT PERK" />
        
        <div className="px-6 py-12 md:py-16 mx-auto w-full max-w-5xl flex-1">
          <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
            <div>
              <Link href="/perks" className="text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono hover:text-[--color-foreground] transition-colors mb-4 inline-block">
                &lt;- Back to perks
              </Link>
              <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-5xl">
                Submit a Perk
              </h1>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-[--color-foreground] mb-4">
                  Partner with the Solana Builders Club
                </h2>
                <p className="text-sm leading-relaxed text-[--color-subtle] mb-6">
                  Offer a discount, free credits, or special access to our community of Solana founders and developers. All perks are manually reviewed before being listed.
                </p>
                <div className="border-[0.5px] border-white/10 bg-[--color-surface] p-6 text-sm text-[--color-subtle]">
                  <h3 className="font-bold text-[--color-foreground] mb-2 font-mono uppercase tracking-widest text-[10px]">What we look for:</h3>
                  <ul className="list-disc pl-4 space-y-2 mt-4">
                    <li>Exclusive deals not available to the general public</li>
                    <li>Tools and services useful for Solana developers and startups</li>
                    <li>Clear instructions on how to claim the perk</li>
                  </ul>
                </div>
              </div>

              {success && (
                <div className="mb-8 border-[0.5px] border-[--color-accent-secondary] p-4 text-sm font-mono text-[--color-accent-secondary] bg-[--color-accent-secondary]/10">
                  Perk submitted successfully! We will review it shortly.
                </div>
              )}
              {error && (
                <div className="mb-8 border-[0.5px] border-[--color-warning] p-4 text-sm font-mono text-[--color-warning] bg-[--color-warning]/10">
                  {error}
                </div>
              )}
            </div>

            <aside className="border-[0.5px] border-white/10 bg-[--color-bg] p-1 relative group animate-fade-in delay-100">
              <div className="border-[0.5px] border-dashed border-white/10 p-6 flex flex-col bg-[--color-surface]/50 transition-colors group-hover:bg-[--color-surface]">
                <form action={submitPartnerPerk} className="grid gap-6">
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
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                    />
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
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                    />
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
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors resize-y"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="logo" className="text-sm font-medium text-[--color-foreground]">
                      Project logo *
                    </label>
                    <ImageUploadPreview name="logo" required={true} />
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
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                    />
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
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors resize-y"
                    />
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
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm font-mono focus:border-white/50 focus:outline-none transition-colors"
                    />
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
                        className="w-full pl-8 border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                    <p className="text-xs text-[--color-subtle] font-mono mt-1">So we can contact you if needed.</p>
                  </div>

                  <div className="mt-6 border-t-[0.5px] border-white/10 pt-6">
                    <button type="submit" className="btn-primary corner-brackets w-full justify-center">
                      Submit for Review
                    </button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
