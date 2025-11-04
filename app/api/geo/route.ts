import { NextRequest, NextResponse } from 'next/server'

interface GeoData {
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
}

// Cache for IP lookups (in-memory, resets on server restart)
const geoCache = new Map<string, { data: GeoData; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

async function getGeoFromIP(ip: string): Promise<GeoData | null> {
  // Check cache first
  const cached = geoCache.get(ip)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // Option 1: Free IP lookup using ipapi.co (free tier: 1000 requests/day)
    // You can also use: ipinfo.io, ipregistry.co, or geojs.io
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'StrengthGuide/1.0',
      },
    })

    if (!response.ok) {
      // Fallback to ipinfo.io (free tier available)
      const fallbackResponse = await fetch(`https://ipinfo.io/${ip}/json`, {
        headers: {
          'User-Agent': 'StrengthGuide/1.0',
        },
      })

      if (!fallbackResponse.ok) {
        return null
      }

      const fallbackData = await fallbackResponse.json()
      const [lat, lon] = fallbackData.loc?.split(',').map(Number) || [0, 0]

      const geoData: GeoData = {
        country: fallbackData.country || 'Unknown',
        countryCode: fallbackData.country || 'US',
        region: fallbackData.region || '',
        regionName: fallbackData.region || '',
        city: fallbackData.city || '',
        timezone: fallbackData.timezone || 'UTC',
        lat,
        lon,
      }

      geoCache.set(ip, { data: geoData, timestamp: Date.now() })
      return geoData
    }

    const data = await response.json()

    if (data.error) {
      return null
    }

    const geoData: GeoData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'US',
      region: data.region_code || '',
      regionName: data.region || '',
      city: data.city || '',
      timezone: data.timezone || 'UTC',
      lat: data.latitude || 0,
      lon: data.longitude || 0,
      currency: data.currency || 'USD',
      currencySymbol: data.currency_symbol || '$',
    }

    // Cache the result
    geoCache.set(ip, { data: geoData, timestamp: Date.now() })
    return geoData
  } catch (error) {
    console.error('Error fetching geo data:', error)
    return null
  }
}

function getClientIP(request: NextRequest): string {
  // Try various headers (order matters)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback for localhost/development
  return request.ip || '127.0.0.1'
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Skip lookup for localhost in development
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return NextResponse.json({
        country: 'United States',
        countryCode: 'US',
        region: 'CA',
        regionName: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        lat: 37.7749,
        lon: -122.4194,
        currency: 'USD',
        currencySymbol: '$',
        ip,
        source: 'default',
      })
    }

    const geoData = await getGeoFromIP(ip)

    if (!geoData) {
      return NextResponse.json(
        { error: 'Unable to determine location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...geoData,
      ip,
      source: 'ipapi.co',
    })
  } catch (error) {
    console.error('Error in geo API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geo data' },
      { status: 500 }
    )
  }
}

