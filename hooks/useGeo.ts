'use client'

import { useState, useEffect } from 'react'

export interface GeoData {
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  timezone: string
  lat: number
  lon: number
  currency?: string
  currencySymbol?: string
  ip?: string
  source?: string
}

export function useGeo() {
  const [geo, setGeo] = useState<GeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if geo data is already in cookies
    const geoCountry = document.cookie
      .split('; ')
      .find((row) => row.startsWith('geo_country='))
      ?.split('=')[1]

    const geoRegion = document.cookie
      .split('; ')
      .find((row) => row.startsWith('geo_region='))
      ?.split('=')[1]

    if (geoCountry && geoRegion) {
      // Parse geo data from cookies
      const geoData: GeoData = {
        country: decodeURIComponent(geoCountry),
        countryCode: document.cookie
          .split('; ')
          .find((row) => row.startsWith('geo_countryCode='))
          ?.split('=')[1] || '',
        region: decodeURIComponent(geoRegion),
        regionName: document.cookie
          .split('; ')
          .find((row) => row.startsWith('geo_regionName='))
          ?.split('=')[1] || '',
        city: document.cookie
          .split('; ')
          .find((row) => row.startsWith('geo_city='))
          ?.split('=')[1] || '',
        timezone: document.cookie
          .split('; ')
          .find((row) => row.startsWith('geo_timezone='))
          ?.split('=')[1] || 'UTC',
        lat: parseFloat(
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('geo_lat='))
            ?.split('=')[1] || '0'
        ),
        lon: parseFloat(
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('geo_lon='))
            ?.split('=')[1] || '0'
        ),
        currency: document.cookie
          .split('; ')
          .find((row) => row.startsWith('geo_currency='))
          ?.split('=')[1] || 'USD',
        currencySymbol: document.cookie
          .split('; ')
          .find((row) => row.startsWith('geo_currencySymbol='))
          ?.split('=')[1] || '$',
      }

      setGeo(geoData)
      setLoading(false)
      return
    }

    // Fetch geo data from API
    fetch('/api/geo')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch geo data')
        }
        return res.json()
      })
      .then((data: GeoData) => {
        setGeo(data)

        // Store geo data in cookies (client-side)
        const maxAge = 365 * 24 * 60 * 60 // 1 year
        const cookieOptions = `max-age=${maxAge}; path=/; SameSite=Lax`

        document.cookie = `geo_country=${encodeURIComponent(data.country)}; ${cookieOptions}`
        document.cookie = `geo_countryCode=${data.countryCode}; ${cookieOptions}`
        document.cookie = `geo_region=${encodeURIComponent(data.region)}; ${cookieOptions}`
        document.cookie = `geo_regionName=${encodeURIComponent(data.regionName)}; ${cookieOptions}`
        document.cookie = `geo_city=${encodeURIComponent(data.city)}; ${cookieOptions}`
        document.cookie = `geo_timezone=${data.timezone}; ${cookieOptions}`
        document.cookie = `geo_lat=${data.lat}; ${cookieOptions}`
        document.cookie = `geo_lon=${data.lon}; ${cookieOptions}`
        if (data.currency) {
          document.cookie = `geo_currency=${data.currency}; ${cookieOptions}`
        }
        if (data.currencySymbol) {
          document.cookie = `geo_currencySymbol=${data.currencySymbol}; ${cookieOptions}`
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching geo data:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { geo, loading, error }
}

