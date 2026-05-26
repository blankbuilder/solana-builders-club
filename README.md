# Solana Builders Club

A private network for Solana builders, developers, and creators sharing ideas, market insight, and opportunities.

## Tech Stack

- **Framework**: [Next.js v16](https://nextjs.org/) App Router with TypeScript
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

# Start production server after building
npm run start

# Type checking
npm run check

# Lint
npm run lint

# Run pending database migrations
npm run db:migrate

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── app/            # Next.js App Router routes and API handlers
├── components/     # Reusable UI components
├── lib/            # Server utilities for members and Telegram verification
└── types/          # TypeScript type definitions
db/
└── migrations/     # Hand-written Neon/Postgres migrations
public/
├── members/        # Member logo images
├── favicon.svg     # Site favicon
├── favicon.ico     # Search and browser favicon fallback
└── logo.svg        # Site logo
```

## Adding Members

To add a new member, place their logo image in the `public/members/` directory:

- Supported formats: `.svg`, `.png`, `.jpg`, `.webp`
- Filename becomes the display name (hyphens become spaces)
- Example: `john-doe.svg` displays as "john doe"

## Adding Perks

Partner perks are submitted through `/partners/perks/new` and managed in `/admin/perks`.

- Partner submissions start as `submitted`.
- Public submissions collect Telegram username, project details, logo upload, offer terms, and an optional offer code.
- Approved perks appear on `/perks`.
- Offer codes are only shown on `/perks/claim/[perkId]` after Telegram membership verification.

## Database

Perks are stored in Neon/Postgres. Configure `DATABASE_URL`, then run:

```bash
npm run db:migrate
```

The migration runner applies pending SQL files from `db/migrations/`, records them in
`schema_migrations`, and is safe to rerun. For local development, put your local Neon URL in
`.env.local` or prefix the command:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate
```

Production migrations run automatically during Vercel production deploys. Add the production
Neon URL as the Vercel Production environment variable `DATABASE_URL`. Vercel runs
`npm run db:migrate:production` before the production build, and that command skips preview and
local builds.

## Telegram Membership Gate

Copy `.env.example` to `.env` for local development and configure:

- `DATABASE_URL` for Neon/Postgres.
- `TELEGRAM_CLIENT_ID` and `TELEGRAM_CLIENT_SECRET` from Telegram Web Login / OIDC.
- `TELEGRAM_REDIRECT_URI`, optional for local testing with an HTTPS tunnel/proxy.
- `TELEGRAM_BOT_TOKEN` for the bot that calls `getChatMember`.
- `TELEGRAM_CHAT_ID` for the private community to verify.
- `TELEGRAM_SESSION_SECRET`, at least 32 characters, for signed verification cookies.
- `NEXT_PUBLIC_SITE_URL`, used as the OIDC redirect origin.
- `ADMIN_TELEGRAM_IDS`, a comma-separated allowlist for `/admin`.

The bot should be an admin in the target Telegram group or channel so it can inspect members.

## Deployment

The site automatically deploys to Vercel when pushing to the `main` branch.
