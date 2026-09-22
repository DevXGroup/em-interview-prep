import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SITE_URL } from '@/lib/site'
import { Navigation } from '@/components/Navigation'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Footer } from '@/components/Footer'
import { DonateToast } from '@/components/DonateToast'

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
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
