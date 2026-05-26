import type { Metadata } from 'next'
import Link from 'next/link'
import AdminHeaderLink from '@/components/AdminHeaderLink'
import { getAdminAuth } from '@/lib/admin'

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
    <div className="min-h-screen p-6 md:p-12">
      <header className="mb-16 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
        >
          SBC
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/perks"
            className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
          >
            Perks
          </Link>
          <AdminHeaderLink />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">Admin</p>
        <h1
          className="mb-6 text-3xl leading-tight font-medium tracking-tight md:text-5xl"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Dashboard
        </h1>

        {auth.status !== 'authorized' ? (
          <AdminAccessState auth={auth} />
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/perks"
              className="group border border-[--color-border] bg-[--color-surface] p-5 transition-colors hover:border-[--color-muted]"
            >
              <p className="mb-3 text-xs uppercase tracking-widest text-[--color-muted]">
                Perks
              </p>
              <h2 className="mb-3 text-xl font-medium text-[--color-foreground]">
                Manage partner perks
              </h2>
              <p className="text-sm leading-relaxed text-[--color-subtle]">
                Review submissions, edit offers, approve or reject perks, and choose featured
                member benefits.
              </p>
            </Link>
          </section>
        )}
      </main>
    </div>
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
          href={`/api/telegram/start?returnTo=${encodeURIComponent('/admin')}`}
          className="inline-flex items-center justify-center border border-[--color-border] px-4 py-2 text-sm text-[--color-foreground] transition-colors hover:border-[--color-foreground]"
        >
          Connect Telegram
        </a>
      </div>
    )
  }

  if (auth.status === 'forbidden') {
    return (
      <Notice>
        Telegram ID {auth.session.telegramUserId} is verified but not in `ADMIN_TELEGRAM_IDS`.
      </Notice>
    )
  }

  return <Notice>`ADMIN_TELEGRAM_IDS` is required before admin access works.</Notice>
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[--color-warning] p-4 text-sm text-[--color-warning]">
      {children}
    </div>
  )
}
