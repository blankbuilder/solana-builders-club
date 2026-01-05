import type { SiteConfig } from './types';

export const siteConfig: SiteConfig = {
  name: 'Solana Builders Club',
  title: 'Solana Builders Club | Exclusive Web3 Developer Community',
  description:
    'A private Telegram community of builders, developers, and creators shaping the future of Solana.',
  metaDescription:
    'Join the exclusive Solana Builders Club: a Web3 network for developers & creators. Weekly Spaces, insider insights, and an invite-only community. Start building today.',
  social: {
    x: 'https://x.com/blankdotbuild',
  },
};

export const SUPPORTED_IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.webp'] as const;
