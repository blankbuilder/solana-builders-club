import Link from 'next/link'
import AdminHeaderLink from '@/components/AdminHeaderLink'
import MemberCard from '@/components/MemberCard'
import { siteConfig } from '@/config'
import { getMembers } from '@/lib/members'

export default function HomePage() {
  const members = getMembers()

  return (
    <div className="flex min-h-screen flex-col p-6 md:p-12">
      <header className="flex items-center justify-end gap-6 animate-fade-in">
        <AdminHeaderLink />
        <Link
          href="/perks"
          className="text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
        >
          Perks
        </Link>
        <button
          data-tally-open={siteConfig.waitlistTallyId}
          data-tally-emoji-animation="wave"
          className="cursor-pointer border-0 bg-transparent text-[10px] uppercase tracking-widest text-[--color-muted] transition-colors hover:text-[--color-foreground] md:text-xs"
          type="button"
        >
          Join waitlist
        </button>
      </header>

      <main className="flex flex-1 items-start pt-12 pb-12 md:items-center md:pt-0">
        <div className="w-full max-w-5xl">
          <h1
            className="mb-8 text-2xl leading-tight font-medium tracking-tight animate-fade-in delay-100 md:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            <span className="gradient-text">Solana</span>{' '}
            <span className="text-[--color-foreground]">Builders</span>{' '}
            <span className="text-[--color-foreground]">Club</span>
          </h1>

          <p className="mb-16 max-w-lg text-sm leading-relaxed text-[--color-subtle] animate-fade-in delay-200">
            {siteConfig.description}
          </p>

          <div className="mb-12 animate-fade-in delay-200">
            <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">
              Our members are part of
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {members.map((member) => (
                <MemberCard key={member.image} member={member} />
              ))}
            </div>
          </div>

          <div className="mb-20 animate-fade-in delay-300">
            <p className="mb-4 text-xs uppercase tracking-widest text-[--color-muted]">
              Weekly Spaces
            </p>
            <p className="mb-4 max-w-lg text-sm leading-relaxed text-[--color-subtle]">
              We organize weekly X Spaces. We talk about Solana, the market, entrepreneurship,
              dev, and many other topics.
            </p>
            <p className="max-w-lg text-sm leading-relaxed text-[--color-subtle]">
              Follow us on{' '}
              <a
                href={siteConfig.social.x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[--color-accent] underline"
              >
                {siteConfig.social.xHandle}
              </a>{' '}
              for upcoming Spaces.
            </p>
          </div>

          <div className="mb-4 h-px w-full bg-white/20 animate-fade-in delay-400 md:w-96" />
          <div className="animate-fade-in delay-400">
            <p className="mb-3 text-xs text-[--color-muted]">
              Want to join the private community? It is hosted by Blank.
            </p>
            <button
              data-tally-open={siteConfig.waitlistTallyId}
              data-tally-emoji-animation="wave"
              className="inline-flex cursor-pointer items-center gap-2 border-0 border-b border-[--color-border] bg-transparent pb-0.5 text-sm text-[--color-foreground] transition-colors hover:border-[--color-foreground]"
              type="button"
            >
              Join the waitlist
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
