'use client'

import { useEffect, useState } from 'react'
import { useGeo } from '@/hooks/useGeo'
import AdBanner from './AdBanner'

interface GeoAdBannerProps {
  size: 'leaderboard' | 'rectangle' | 'square' | 'skyscraper' | 'mobile'
  className?: string
  fallbackAd?: React.ReactNode
}

// Country-specific ad configurations
const GEO_AD_CONFIG: Record<string, { adUnit?: string; provider?: string }> = {
  US: { provider: 'google-adsense' },
  CA: { provider: 'google-adsense' },
  GB: { provider: 'google-adsense' },
  AU: { provider: 'google-adsense' },
  // Add more country-specific configurations as needed
}

export default function GeoAdBanner({
  size,
  className = '',
  fallbackAd,
}: GeoAdBannerProps) {
  const { geo, loading } = useGeo()
  const [adConfig, setAdConfig] = useState<{ provider?: string } | null>(null)

  useEffect(() => {
    if (geo) {
      const config = GEO_AD_CONFIG[geo.countryCode] || { provider: 'default' }
      setAdConfig(config)
    }
  }, [geo])

  // Show loading state or fallback while detecting location
  if (loading) {
    return fallbackAd || <AdBanner size={size} className={className} />
  }

  // Use geo-specific ad configuration if available
  // For now, we'll use the standard AdBanner component
  // You can extend this to load different ad scripts based on geo
  return <AdBanner size={size} className={className} />
}

