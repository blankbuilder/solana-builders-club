import type { SiteConfig } from './types'

export const siteConfig: SiteConfig = {
  name: 'Solana Builders Club',
  url: 'https://solanabuilders.club',
  domain: 'solanabuilders.club',
  title: 'Solana Builders Club | Solana Founder & Developer Community',
  description:
    "A private community for Solana founders, developers, and builders. Share what you're working on, meet other teams, find collaborators, hire talent, discover opportunities, get perks, and connect with people building across the ecosystem.",
  metaDescription:
    'Solana Builders Club is a private community for Solana founders, developers, and builders. Join weekly X Spaces, share your work, and connect with other teams.',
  waitlistTallyId: 'zx7AAk',
  social: {
    x: 'https://x.com/Solbuildersclub',
    xHandle: '@Solbuildersclub',
  },
}

export const SUPPORTED_IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.webp'] as const
