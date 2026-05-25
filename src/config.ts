import type { SiteConfig } from './types';

export const siteConfig: SiteConfig = {
  name: 'Solana Builders Club',
  title: 'Solana Builders Club | Solana Founder & Developer Community',
  description:
    "A private community for Solana founders, developers, and builders. Share what you're building, learn from other teams, and connect across the ecosystem.",
  metaDescription:
    'Solana Builders Club is a private community for Solana founders, developers, and builders. Join weekly X Spaces, share your work, and connect with other teams.',
  social: {
    x: 'https://x.com/blankdotbuild',
  },
};

export const SUPPORTED_IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.webp'] as const;
