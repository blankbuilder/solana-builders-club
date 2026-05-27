import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import './globals.css'
import { PlausibleTracker } from '@/components/PlausibleTracker'
import { siteConfig } from '@/config'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.metaDescription,
  alternates: {
    canonical: '/',
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.metaDescription,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.social.xHandle,
    title: siteConfig.title,
    description: siteConfig.metaDescription,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-site-domain={siteConfig.domain}>
      <body className="min-h-screen overflow-auto">
        <PlausibleTracker domain={siteConfig.domain} />
        <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  )
}
