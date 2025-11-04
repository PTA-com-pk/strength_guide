import { Metadata } from 'next'

export interface SeoMetadata {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  nofollow?: boolean
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export function generateSeoMetadata({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
}: SeoMetadata): Metadata {
  const fullTitle = title.includes('|') ? title : `${title} | StrengthGuide`
  const canonicalUrl = canonical || baseUrl
  const ogImageUrl = ogImage || `${baseUrl}/og-image.jpg`

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'StrengthGuide',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: ogType,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description,
      images: ogImage ? [ogImageUrl] : undefined,
      ...(author && { creator: author }),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

// Helper function to generate geo-targeted titles
export function generateGeoTargetedTitle(
  baseTitle: string,
  country?: string,
  region?: string
): string {
  if (!country && !region) {
    return baseTitle
  }

  // Add location context to title if relevant
  const location = region ? `${region}, ${country}` : country
  return `${baseTitle} in ${location}`
}

// Helper function to format currency based on geo
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  currencySymbol: string = '$'
): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${currencySymbol}${amount.toLocaleString()}`
  }
}

