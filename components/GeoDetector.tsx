'use client'

import { useEffect } from 'react'
import { useGeo } from '@/hooks/useGeo'

/**
 * GeoDetector component - Automatically detects and stores user's location
 * This component runs silently in the background to populate geo cookies
 */
export default function GeoDetector() {
  const { geo } = useGeo()

  useEffect(() => {
    // Geo detection happens automatically via useGeo hook
    // This component just ensures the hook is active
    if (geo) {
      // Optionally log geo data for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Geo detected:', geo)
      }
    }
  }, [geo])

  return null
}

