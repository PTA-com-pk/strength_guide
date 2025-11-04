import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterPopup from '@/components/NewsletterPopup'
import { CookieProvider } from '@/contexts/CookieContext'
import CookieBanner from '@/components/CookieBanner'
import CookieSettings from '@/components/CookieSettings'
import AnalyticsScript from '@/components/AnalyticsScript'
import AdScript from '@/components/AdScript'
import GeoDetector from '@/components/GeoDetector'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://strengthguide.net'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'StrengthGuide - Your Ultimate Strength Training Resource',
    template: '%s | StrengthGuide',
  },
  description: 'Get expert advice on muscle building, fat loss, nutrition, and strength training. Free workouts, diet plans, and fitness tips from certified trainers and nutritionists.',
  keywords: ['fitness', 'muscle building', 'fat loss', 'nutrition', 'workouts', 'strength training', 'bodybuilding', 'cardio', 'weightlifting', 'diet plans', 'strength guide'],
  authors: [{ name: 'StrengthGuide Team' }],
  creator: 'StrengthGuide',
  publisher: 'StrengthGuide',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'StrengthGuide',
    title: 'StrengthGuide - Your Ultimate Strength Training Resource',
    description: 'Get expert advice on muscle building, fat loss, nutrition, and strength training. Free workouts, diet plans, and fitness tips.',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'StrengthGuide - Fitness and Health Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrengthGuide - Your Ultimate Strength Training Resource',
    description: 'Get expert advice on muscle building, fat loss, nutrition, and strength training.',
    images: [`${baseUrl}/og-image.jpg`],
    creator: '@strengthguide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const googleAdsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
  const ezoicId = process.env.NEXT_PUBLIC_EZOIC_ID

  return (
    <html lang="en">
      <body className={inter.className}>
        <CookieProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <NewsletterPopup />
          <CookieBanner />
          <CookieSettings />
          <AnalyticsScript gaId={gaId} />
          <AdScript ezoicId={ezoicId} googleAdsenseId={googleAdsenseId} />
          <GeoDetector />
        </CookieProvider>
      </body>
    </html>
  )
}

