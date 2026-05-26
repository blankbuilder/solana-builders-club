import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updatePerkAction } from '@/app/admin/perks/actions'
import { getAdminAuth } from '@/lib/admin'
import { getPerk } from '@/lib/perks/queries'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'
import { ImageUploadPreview } from '@/components/ImageUploadPreview'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Perk',
  description: 'Edit a partner perk submission.',
  robots: {
    index: false,
    follow: false,
  },
}

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
  params: Promise<{ perkId: string }>
  searchParams: Promise<SearchParams>
}

export default async function EditPerkPage({ params, searchParams }: PageProps) {
  const [{ perkId }, queryParams, auth] = await Promise.all([
    params,
    searchParams,
    getAdminAuth(),
  ])

  if (auth.status !== 'authorized') {
    return (
      <PageWrapper>
        <div className="w-full relative border-b-[0.5px] border-white/20 flex-1 flex flex-col">
          <SectionHeader current="ADMIN" title="EDIT PERK" />
          <div className="px-6 py-12 md:py-16 mx-auto w-full max-w-3xl flex-1">
            <div className="border-[0.5px] border-white/20 bg-[--color-surface] p-6 text-sm text-[--color-warning] font-mono">
              Not authorized. <Link href="/admin" className="underline hover:text-[--color-foreground]">Go to admin dashboard</Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const perk = await getPerk(perkId)

  if (!perk) {
    notFound()
  }

  const adminMessage = firstParam(queryParams.admin)
  const adminError = firstParam(queryParams.admin_error)

  return (
    <PageWrapper>
      <div className="w-full relative border-b-[0.5px] border-white/20 flex-1 flex flex-col">
        <SectionHeader current="ADMIN" title="EDIT PERK" />
        
        <div className="px-6 py-12 md:py-16 mx-auto w-full max-w-3xl flex-1">
          <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
            <div>
              <Link href="/admin/perks" className="text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono hover:text-[--color-foreground] transition-colors mb-4 inline-block">
                &lt;- Back to perks
              </Link>
              <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-5xl">
                Edit Perk
              </h1>
              <p className="mt-4 text-sm text-[--color-subtle] font-mono">
                Modifying perk details and status.
              </p>
            </div>
          </div>

          {adminMessage && (
            <div className="mb-8 border-[0.5px] border-[--color-accent-secondary] p-4 text-sm font-mono text-[--color-accent-secondary] bg-[--color-accent-secondary]/10">
              Perk updated successfully.
            </div>
          )}
          {adminError && (
            <div className="mb-8 border-[0.5px] border-[--color-warning] p-4 text-sm font-mono text-[--color-warning] bg-[--color-warning]/10">
              {adminError}
            </div>
          )}

          <div className="border-[0.5px] border-white/20 bg-[--color-surface] p-6 md:p-8">
            <div className="mb-8 flex flex-col gap-4 border-b-[0.5px] border-white/20 pb-6">
              <div className="flex items-center gap-4">
                {perk.logoDataUrl && (
                  <img src={perk.logoDataUrl} alt={perk.projectName} className="w-12 h-12 object-contain" />
                )}
                <div>
                  <h2 className="text-lg font-bold">{perk.projectName}</h2>
                  <p className="text-xs text-[--color-subtle] font-mono">{perk.telegramUsername}</p>
                </div>
              </div>
            </div>

            <form action={updatePerkAction} className="grid gap-6">
              <input type="hidden" name="id" value={perk.id} />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium text-[--color-foreground]">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      name="status"
                      defaultValue={perk.status}
                      required
                      className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 pr-10 text-sm font-mono focus:border-white/50 focus:outline-none transition-colors appearance-none"
                    >
                      <option value="submitted">SUBMITTED</option>
                      <option value="approved">APPROVED</option>
                      <option value="rejected">REJECTED</option>
                      <option value="paused">PAUSED</option>
                      <option value="archived">ARCHIVED</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-transparent select-none pointer-events-none" aria-hidden="true">
                    Spacer
                  </label>
                  <label htmlFor="featured" className="flex items-center gap-3 cursor-pointer group h-[46px]">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        defaultChecked={perk.featured}
                        className="peer appearance-none w-5 h-5 border-[0.5px] border-white/20 bg-[--color-bg] checked:bg-[--color-foreground] checked:border-[--color-foreground] transition-colors cursor-pointer rounded-none"
                      />
                      <svg
                        className="absolute w-3.5 h-3.5 text-[--color-bg] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[--color-foreground] group-hover:opacity-80 transition-opacity">
                      Featured Perk
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="rejectionReason" className="text-sm font-medium text-[--color-foreground]">
                  Rejection Reason <span className="text-[--color-subtle] font-mono text-xs">(if applicable)</span>
                </label>
                <input
                  type="text"
                  id="rejectionReason"
                  name="rejectionReason"
                  defaultValue={perk.rejectionReason ?? ''}
                  placeholder="Explain why this perk was rejected (only visible to admins/submitter)"
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="my-2 border-t-[0.5px] border-white/20" />

              <div className="grid gap-2">
                <label htmlFor="telegramUsername" className="text-sm font-medium text-[--color-foreground]">
                  Submitter Telegram Username
                </label>
                <input
                  type="text"
                  id="telegramUsername"
                  name="telegramUsername"
                  defaultValue={perk.telegramUsername}
                  required
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm font-mono focus:border-white/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="projectName" className="text-sm font-medium text-[--color-foreground]">
                  Project name
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  defaultValue={perk.projectName}
                  required
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="projectWebsite" className="text-sm font-medium text-[--color-foreground]">
                  Project website
                </label>
                <input
                  type="url"
                  id="projectWebsite"
                  name="projectWebsite"
                  defaultValue={perk.projectWebsite}
                  required
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="projectDescription" className="text-sm font-medium text-[--color-foreground]">
                  Project description
                </label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  defaultValue={perk.projectDescription}
                  required
                  rows={3}
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors resize-y"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="logo" className="text-sm font-medium text-[--color-foreground]">
                  Upload New Logo <span className="text-[--color-subtle] font-mono text-xs">(optional, overrides existing)</span>
                </label>
                <ImageUploadPreview
                  name="logo"
                  existingUrl={perk.logoDataUrl}
                  existingFileName={deriveLogoFileName(perk.projectName, perk.logoDataUrl)}
                />
              </div>

              <div className="my-2 border-t-[0.5px] border-white/20" />

              <div className="grid gap-2">
                <label htmlFor="offerTitle" className="text-sm font-medium text-[--color-foreground]">
                  Offer title
                </label>
                <input
                  type="text"
                  id="offerTitle"
                  name="offerTitle"
                  defaultValue={perk.offerTitle}
                  required
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm focus:border-white/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="offerTerms" className="text-sm font-medium text-[--color-foreground]">
                  Offer details & Instructions
                </label>
                <textarea
                  id="offerTerms"
                  name="offerTerms"
                  defaultValue={perk.offerTerms}
                  required
                  rows={4}
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
                  defaultValue={perk.offerCode ?? ''}
                  className="w-full border-[0.5px] border-white/20 bg-[--color-bg] p-3 text-sm font-mono focus:border-white/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="mt-6 border-t-[0.5px] border-white/20 pt-6 flex justify-between">
                <button type="submit" className="btn-primary corner-brackets px-12">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

const mimeExtensions: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

function deriveLogoFileName(projectName: string, dataUrl: string): string {
  const mimeMatch = /^data:([^;]+);/.exec(dataUrl)
  const ext = (mimeMatch && mimeExtensions[mimeMatch[1]]) || 'img'
  const slug = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${slug || 'logo'}.${ext}`
}
