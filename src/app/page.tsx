import Link from 'next/link'
import SolanaAsciiAnimation from '@/components/SolanaAsciiAnimation'
import { PageWrapper, SectionHeader } from '@/components/AppLayout'
import { siteConfig } from '@/config'
import { getMembers } from '@/lib/members'

export default function HomePage() {
  const members = getMembers()

  return (
    <PageWrapper topBanner={<TopBanner />}>
      <div className="w-full relative border-b-[0.5px] border-white/10">
        <Hero members={members} />
      </div>

      <div className="w-full relative border-b-[0.5px] border-white/10">
        <SectionHeader current="01" total="03" title="SPACES" />
        <SpacesSection />
      </div>
      
      <div className="w-full relative border-b-[0.5px] border-white/10">
        <SectionHeader current="02" total="03" title="PERKS" />
        <PerksSection />
      </div>
      
      <div className="w-full bg-[--color-panel]/50 relative">
        <SectionHeader current="03" total="03" title="JOIN" />
        <JoinSection />
      </div>
    </PageWrapper>
  )
}

function TopBanner() {
  return (
    <div className="px-6 py-2.5 animate-fade-in text-center flex justify-center bg-white text-black">
      <Link
        href="/perks"
        className="group inline-flex items-center justify-center gap-3 text-[11px] transition-colors hover:opacity-80 font-mono"
      >
        <span className="bg-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
          New
        </span>
        <span className="uppercase tracking-widest font-semibold">Member perks are live</span>
        <span className="transition-transform group-hover:translate-x-0.5">
          -&gt;
        </span>
      </Link>
    </div>
  )
}

function Hero({ members }: { members: ReturnType<typeof getMembers> }) {
  const duplicatedMembers = [...members, ...members, ...members, ...members, ...members, ...members];

  return (
    <section className="relative flex flex-col min-h-[calc(100vh-100px)]">
      <div className="px-6 py-8 md:py-12 lg:py-16 flex-1 flex items-center">
        <div className="grid gap-12 w-full md:grid-cols-[1fr_auto] md:items-center md:gap-16">
          <div className="relative z-10">
            <h1
              className="mb-6 max-w-2xl text-4xl leading-[1.1] font-semibold tracking-tight animate-fade-in md:text-5xl lg:text-7xl"
            >
              <span className="text-[--color-foreground]">Build, ship, and scale</span>
              <br />
              <span className="text-[--color-foreground]">with the best teams on </span>
              <span className="text-[--color-foreground] border-b border-[--color-foreground] border-dashed">Solana</span>
              <span className="text-[--color-accent-secondary]">.</span>
            </h1>

            <p className="mb-10 max-w-xl text-base leading-relaxed text-[--color-subtle] animate-fade-in delay-100 md:text-lg">
              {siteConfig.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in delay-200">
              <button
                data-tally-open={siteConfig.waitlistTallyId}
                data-tally-emoji-animation="wave"
                className="btn-primary corner-brackets"
                type="button"
              >
                Join the waitlist
              </button>
              <Link href="/perks" className="btn-secondary corner-brackets">
                Browse perks
              </Link>
            </div>
          </div>

          <div className="animate-fade-in delay-300 relative z-10 flex justify-center md:justify-end">
            <SolanaAsciiAnimation />
          </div>
        </div>
      </div>

      <div className="flex items-stretch overflow-hidden w-full h-[120px] sm:h-[140px] bg-transparent border-y-[0.5px] border-white/10 mt-auto mb-24 lg:mb-32">
        <div className="flex-none flex items-center justify-center px-6 sm:px-8 border-r-[0.5px] border-white/10 w-[160px] sm:w-[240px] shrink-0 bg-[--color-bg] z-10 relative">
          <div className="flex flex-col text-xs sm:text-sm font-medium">
            <span className="text-[--color-foreground]">Our members</span>
            <span className="text-[--color-warning]">are part of</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex group/marquee">
          <div 
            className="flex w-max group-hover/marquee:[animation-play-state:paused]"
            style={{ animation: 'marquee 120s linear infinite' }}
          >
            {duplicatedMembers.map((member, i) => (
              <div 
                key={`${member.name}-${i}`}
                className="flex-none flex flex-col items-center justify-center w-[160px] sm:w-[200px] border-r-[0.5px] border-white/10 group relative transition-colors hover:bg-[--color-surface]/30 bg-transparent h-[120px] sm:h-[140px] gap-3"
                title={member.name}
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="max-h-7 sm:max-h-8 max-w-[100px] sm:max-w-[120px] opacity-70 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0"
                  loading="lazy"
                />
                <span className="text-[10px] font-mono text-[--color-subtle] group-hover:text-[--color-foreground] transition-colors">
                  {member.name}
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[--color-warning] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SpacesSection() {
  return (
    <section className="px-6 py-24 lg:py-32 flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
      <div className="flex-1 max-w-2xl animate-fade-in">
        <div className="mb-8 flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase text-[--color-subtle]">
          <span className="text-[--color-warning]">Share</span>
          <span className="text-white/20">//</span>
          <span>Learn</span>
          <span className="text-white/20">//</span>
        </div>
        <h2
          className="mb-6 text-3xl font-semibold tracking-tight text-[--color-foreground] md:text-4xl lg:text-5xl leading-[1.1] text-balance"
        >
          Conversations every week, live on <span className="border-b border-dashed border-white/20 pb-1">X</span>.
        </h2>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-[--color-subtle]">
          We host weekly X Spaces with founders and operators building on Solana. 
          We talk about the market, product, dev, entrepreneurship, and what people 
          are actually shipping in the ecosystem.
        </p>
        <a
          href={siteConfig.social.x}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary corner-brackets inline-flex animate-fade-in delay-100"
        >
          Follow {siteConfig.social.xHandle} on X
        </a>
      </div>

      <div className="flex-1 w-full animate-fade-in delay-200">
        <div className="border-[0.5px] border-white/10 bg-[--color-bg] p-1 relative overflow-hidden group">
          <div className="border-[0.5px] border-dashed border-white/10 p-6 h-full flex flex-col bg-[--color-surface]/50 transition-colors group-hover:bg-[--color-surface]">
            <div className="mb-6 flex items-start justify-between border-b-[0.5px] border-white/10 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold tracking-tight text-[--color-foreground]">SOLANA BUILDERS SPACE</span>
              </div>
            </div>
            
            <div className="flex flex-col relative">
              <div className="flex-1 flex flex-col">
                <span className="text-xs font-mono uppercase tracking-widest text-[--color-foreground] mb-4">Examples of topics:</span>
                <div 
                  className="space-y-3 flex-1 pb-4"
                  style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' }}
                >
                  {[
                    "How will AI agents shape the Solana ecosystem?",
                    "How to design applications for a cross-chain future?",
                    "How to integrate x402 in your app?",
                    "How to improve your external communication and marketing?",
                    "What makes the difference between successful builders and others?",
                    "What metrics build confidence in a project before launch?",
                    "Do we really need more L1s or L2s?"
                  ].map((topic, i) => (
                    <div key={i} className="flex gap-3 text-xs sm:text-sm text-[--color-subtle] leading-relaxed items-start">
                      <span className="text-[--color-warning] mt-0.5">•</span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PerksSection() {
  return (
    <section className="px-6 py-24 lg:py-32 flex flex-col md:flex-row-reverse gap-12 lg:gap-24 items-center">
      <div className="flex-1 max-w-2xl animate-fade-in">
        <div className="mb-8 flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase text-[--color-subtle]">
          <span className="text-[--color-accent-secondary]">Ecosystem</span>
          <span className="text-white/20">//</span>
          <span>Member Deals</span>
          <span className="text-white/20">//</span>
        </div>
        <h2
          className="mb-6 text-3xl font-semibold tracking-tight text-[--color-foreground] md:text-4xl lg:text-5xl leading-[1.1]"
        >
          Partner offers,<br/>reserved for <span className="border-b border-dashed border-white/20 pb-1">members</span>.
        </h2>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-[--color-subtle]">
          Verified Solana Builders Club members get access to partner perks across the
          ecosystem — infra credits, tooling discounts, and dedicated offers from teams we
          work with. Telegram membership unlocks claim links.
        </p>
        <Link href="/perks" className="btn-secondary corner-brackets inline-flex animate-fade-in delay-100">
          Browse all perks
        </Link>
      </div>

      <div className="flex-1 w-full animate-fade-in delay-200">
        <div className="grid grid-cols-2 border-[0.5px] border-white/10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
          {[
            { id: '01', name: 'Infrastructure', val: 'Credits' },
            { id: '02', name: 'Dev Tooling', val: 'Discounts' },
            { id: '03', name: 'Security Audits', val: 'Priority' },
            { id: '04', name: 'Ecosystem', val: 'Grants' },
          ].map((item) => (
            <div key={item.id} className="p-6 lg:p-8 flex flex-col justify-between aspect-square group transition-all duration-500 relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent">
              <span className="text-[10px] font-mono text-white/20 group-hover:text-[--color-warning] transition-colors relative z-10">[{item.id}]</span>
              <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-500">
                <div className="text-sm font-medium text-[--color-foreground] mb-1 group-hover:text-white transition-colors duration-500">{item.name}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[--color-subtle] group-hover:text-white/80 transition-colors duration-500">{item.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function JoinSection() {
  return (
    <section className="px-6 py-24 lg:py-32 flex justify-center">
      <div className="animate-fade-in text-center flex flex-col items-center p-8 max-w-2xl">
        <h2
          className="mb-6 text-3xl leading-tight font-semibold tracking-tight text-[--color-foreground] md:text-5xl"
        >
          Want to join the private community?
        </h2>
        <p className="mb-10 text-base leading-relaxed text-[--color-subtle]">
          Every application is reviewed manually. The club is gated through Telegram so it stays small and active.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            data-tally-open={siteConfig.waitlistTallyId}
            data-tally-emoji-animation="wave"
            className="btn-primary corner-brackets"
            type="button"
          >
            Join the waitlist
          </button>
          <a
            href={siteConfig.social.x}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary corner-brackets"
          >
            Follow on X
          </a>
        </div>
      </div>
    </section>
  )
}
