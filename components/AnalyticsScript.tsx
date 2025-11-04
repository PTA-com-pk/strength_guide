'use client'

import { useEffect } from 'react'
import { useCookie } from '@/contexts/CookieContext'
import Script from 'next/script'

interface AnalyticsScriptProps {
  gaId?: string
}

export default function AnalyticsScript({ gaId }: AnalyticsScriptProps) {
  const { hasConsentFor } = useCookie()

  // Only load if user has consented to analytics
  if (!hasConsentFor('analytics') || !gaId) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

