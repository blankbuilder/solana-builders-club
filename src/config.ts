import type { SiteConfig } from './types';

export const siteConfig: SiteConfig = {
  name: 'Solana Builders Club',
  description:
    'A private Telegram community of builders, developers, and creators shaping the future of Solana.',
  social: {
    x: 'https://x.com/blankdotbuild',
  },
};

export const SUPPORTED_IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.webp'] as const;
