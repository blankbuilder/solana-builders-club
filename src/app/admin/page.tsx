import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminAuth } from '@/lib/admin'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Solana Builders Club admin dashboard.',
  alternates: {
    canonical: '/admin',
  },
}

export default async function AdminPage() {
  const auth = await getAdminAuth()

  return (
    <PageWrapper>
      <div className="w-full relative border-b-[0.5px] border-white/20 flex-1 flex flex-col">
        <SectionHeader current="ADMIN" title="DASHBOARD" />
        
        <div className="px-6 py-12 md:py-16 mx-auto w-full flex-1">
          <div className="mb-12">
            <h1
              className="mb-4 text-3xl leading-tight font-semibold tracking-tight md:text-5xl"
            >
              Dashboard
            </h1>
            <p className="text-sm text-[--color-subtle] font-mono">
              Manage the Solana Builders Club platform.
            </p>
          </div>

          {auth.status !== 'authorized' ? (
            <AdminAccessState auth={auth} />
          ) : (
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/perks"
                className="group border-[0.5px] border-white/20 bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-colors hover:border-white/20 flex flex-col min-h-[200px]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[--color-warning]">
                    Perks
                  </span>
                  <span className="text-white/20 group-hover:translate-x-1 transition-transform">-&gt;</span>
                </div>
                <h2 className="mb-3 text-xl font-medium text-[--color-foreground]">
                  Manage partner perks
                </h2>
                <p className="text-sm leading-relaxed text-[--color-subtle] flex-1">
                  Review submissions, edit offers, approve or reject perks, and choose featured
                  member benefits.
                </p>
              </Link>
            </section>
          )}
        </div>
      </div>
    </PageWrapper>
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
          href={`/api/telegram/start?returnTo=${encodeURIComponent('/admin')}`}
          className="btn-primary corner-brackets inline-flex"
        >
          Connect Telegram
        </a>
      </div>
    )
  }

  if (auth.status === 'forbidden') {
    return (
      <Notice>
        Telegram ID <span className="text-white">{auth.session.telegramUserId}</span> is verified but not in `ADMIN_TELEGRAM_IDS`.
      </Notice>
    )
  }

  return <Notice>`ADMIN_TELEGRAM_IDS` is required before admin access works.</Notice>
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-[0.5px] border-[--color-warning] p-4 text-sm font-mono text-[--color-warning] bg-[--color-warning]/10 inline-block">
      {children}
    </div>
  )
}
