import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SITE_URL } from '@/lib/site'
import { Navigation } from '@/components/Navigation'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Footer } from '@/components/Footer'
import { DonateToast } from '@/components/DonateToast'

// Self-hosted (OFL, latin subset) so a production build never depends on fonts.googleapis.com.
const sans = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/ibm-plex-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

const display = localFont({
  src: [
    { path: './fonts/source-serif-4-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/source-serif-4-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/source-serif-4-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/source-serif-4-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/source-serif-4-latin-600-italic.woff2', weight: '600', style: 'italic' },
    { path: './fonts/source-serif-4-latin-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['ui-serif', 'Georgia', 'serif'],
})

const mono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-mono-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SWE Interview Prep: Free Software Engineering Interview Class',
    template: '%s | SWE Interview Prep',
  },
  description: 'Free, open-source interview prep for software engineers and engineering managers at Meta, Amazon, Apple, Netflix, Google & Microsoft. Behavioral, system design, coding, technical leadership, team management, and AI interview tracks, plus an eight-week plan.',
  keywords: [
    'engineering manager interview',
    'FAANG interview prep',
    'MAANG interview',
    'EM interview questions',
    'software engineering manager interview',
    'Meta EM interview',
    'Amazon SDM interview',
    'Google EM interview',
    'Apple engineering manager',
    'Netflix engineering manager',
    'Microsoft engineering manager',
    'system design interview',
    'behavioral interview STAR',
    'leadership principles Amazon',
    'technical leadership interview',
    'team management interview',
  ],
  authors: [{ name: 'Max Sheikhizadeh', url: 'https://devxgroup.io' }],
  creator: 'DevXGroup',
  publisher: 'DevXGroup',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'SWE Interview Prep: Free Software Engineering Interview Class',
    description: 'Free, open-source interview prep for software engineers and engineering managers at Meta, Amazon, Apple, Netflix, Google & Microsoft. Behavioral, system design, coding, leadership, and AI topics.',
    url: SITE_URL,
    siteName: 'SWE Interview Prep',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SWE Interview Prep: Free Software Engineering Interview Class',
    description: 'Free, open-source interview prep for software engineers and engineering managers at Meta, Amazon, Apple, Netflix, Google & Microsoft.',
    creator: '@devxgroup',
    site: '@devxgroup',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Navigation />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
          <DonateToast />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
