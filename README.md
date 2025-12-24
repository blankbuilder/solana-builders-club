# Solana Builders Club

A private Telegram community of builders, developers, and creators shaping the future of Solana.

## Tech Stack

- **Framework**: [Astro v5](https://astro.build/) with TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts (BaseLayout)
├── lib/            # Utility functions (members.ts)
├── pages/          # Route pages
├── styles/         # Global CSS
└── types/          # TypeScript type definitions
public/
├── members/        # Member logo images
├── favicon.svg     # Site favicon
└── logo.svg        # Site logo
```

## Adding Members

To add a new member, place their logo image in the `public/members/` directory:

- Supported formats: `.svg`, `.png`, `.jpg`, `.webp`
- Filename becomes the display name (hyphens become spaces)
- Example: `john-doe.svg` displays as "john doe"

## Deployment

The site automatically deploys to Vercel when pushing to the `main` branch.
