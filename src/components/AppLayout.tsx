import React from 'react'
import Link from 'next/link'
import AdminHeaderLink from '@/components/AdminHeaderLink'
import { siteConfig } from '@/config'

export function Crosshair({ className }: { className?: string }) {
  return (
    <svg className={`absolute text-white/20 w-3 h-3 pointer-events-none z-20 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M2 12h20" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-4 animate-fade-in">
      <Link href="/" className="flex items-center gap-2 text-sm font-medium tracking-tight hover:text-[--color-subtle] transition-colors">
        <span className="text-[--color-border-strong] font-mono">[</span>
        <span className="text-[--color-foreground] font-bold">SBC</span>
        <span className="text-[--color-border-strong] font-mono">]</span>
        <span className="hidden text-[--color-foreground] sm:inline uppercase tracking-widest text-[11px] ml-2">Solana Builders Club</span>
      </Link>

      <nav className="flex items-center gap-6">
        <AdminHeaderLink />
        <Link href="/perks" className="nav-link hidden sm:inline">
          Perks
        </Link>
        <button
          data-tally-open={siteConfig.waitlistTallyId}
          data-tally-emoji-animation="wave"
          className="btn-primary corner-brackets"
          type="button"
        >
          Join
        </button>
      </nav>
    </header>
  )
}

export function SectionHeader({ current, total, title }: { current: string, total?: string, title: string }) {
  return (
    <div className="w-full flex items-center px-6 py-3 border-b-[0.5px] border-white/10 text-[10px] font-mono tracking-widest uppercase text-[--color-subtle]">
      <span className="text-white/20 mr-2">[</span>
      <span className="text-[--color-warning]">{current}</span>
      {total && <span className="mx-2 text-white/20">/</span>}
      {total && <span className="text-white/40">{total}</span>}
      <span className="text-white/20 ml-2">]</span>
      <span className="mx-4 text-white/20">·</span>
      {title}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="px-6 py-16 lg:py-24">
      <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-[--color-subtle] transition-colors">
            <span className="text-[--color-border-strong] font-mono">[</span>
            <span className="text-[--color-foreground]">SBC</span>
            <span className="text-[--color-border-strong] font-mono">]</span>
          </Link>
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-[--color-subtle]">
            A private community for Solana founders, developers, and operators.
          </p>
        </div>

        <FooterColumn title="Community">
          <FooterLink href="/perks">Perks</FooterLink>
          <FooterLink href={siteConfig.social.x} external>
            {siteConfig.social.xHandle}
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Partners">
          <FooterLink href="/partners/perks/new">Submit a perk</FooterLink>
          <FooterLink href="/perks">Browse perks</FooterLink>
        </FooterColumn>

        <FooterColumn title="Join">
          <button
            data-tally-open={siteConfig.waitlistTallyId}
            data-tally-emoji-animation="wave"
            className="cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-mono tracking-widest uppercase text-[--color-subtle] transition-colors hover:text-[--color-foreground]"
            type="button"
          >
            Join waitlist
          </button>
        </FooterColumn>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-6 text-[10px] uppercase tracking-widest text-[--color-subtle] font-mono">{title}</p>
      <ul className="flex flex-col gap-4">{children}</ul>
    </div>
  )
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
}) {
  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[--color-subtle] transition-colors hover:text-[--color-foreground]"
        >
          {children}
        </a>
      </li>
    )
  }
  return (
    <li>
      <Link
        href={href}
        className="text-xs font-medium text-[--color-subtle] transition-colors hover:text-[--color-foreground]"
      >
        {children}
      </Link>
    </li>
  )
}

export function PageWrapper({ children, topBanner }: { children: React.ReactNode, topBanner?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col font-sans overflow-x-clip">
      <div className="mx-auto w-full max-w-6xl sm:border-x-[0.5px] border-white/10 flex flex-col flex-1 relative">
        {topBanner && (
          <div className="w-full border-b-[0.5px] border-white/10 relative">
            {topBanner}
          </div>
        )}

        <div className="w-full border-b-[0.5px] border-white/10 bg-[--color-bg]/80 backdrop-blur-md sticky top-0 z-50">
          <Header />
        </div>
        
        <main className="w-full flex-1 flex flex-col relative">
          {children}
        </main>

        <div className="w-full border-t-[0.5px] border-white/10 relative">
          <Footer />
        </div>
        
        <Crosshair className="-bottom-1.5 -left-1.5 opacity-50" />
        <Crosshair className="-bottom-1.5 -right-1.5 opacity-50" />
      </div>
    </div>
  )
}
