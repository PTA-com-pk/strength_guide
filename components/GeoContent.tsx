'use client'

import { useGeo } from '@/hooks/useGeo'
import { ReactNode } from 'react'

interface GeoContentProps {
  children: (geo: { country: string; countryCode: string; region: string }) => ReactNode
  fallback?: ReactNode
}

export default function GeoContent({ children, fallback }: GeoContentProps) {
  const { geo, loading } = useGeo()

  if (loading) {
    return fallback || null
  }

  if (!geo) {
    return fallback || null
  }

  return <>{children({ country: geo.country, countryCode: geo.countryCode, region: geo.region })}</>
}

