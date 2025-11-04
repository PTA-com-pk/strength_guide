'use client'

import { useEffect } from 'react'
import { useCookie } from '@/contexts/CookieContext'
import Script from 'next/script'

interface AdScriptProps {
  ezoicId?: string
  googleAdsenseId?: string
}

export default function AdScript({ ezoicId, googleAdsenseId }: AdScriptProps) {
  const { hasConsentFor } = useCookie()

  // Only load if user has consented to ads
  if (!hasConsentFor('ads')) {
    return null
  }

  return (
    <>
      {/* Google AdSense */}
      {googleAdsenseId && (
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsenseId}`}
          crossOrigin="anonymous"
        />
      )}

      {/* Ezoic */}
      {ezoicId && (
        <Script
          id="ezoic"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var ezoicId = '${ezoicId}';
              // Add your Ezoic script here
            `,
          }}
        />
      )}
    </>
  )
}

