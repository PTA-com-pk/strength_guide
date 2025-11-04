import { NextRequest, NextResponse } from 'next/server'
import { setCookieConsent, setCookiePreferences, getCookieConsent } from '@/lib/cookies-server'
import { CookieConsent, CookiePreferences } from '@/lib/cookies'
import { z } from 'zod'

const consentSchema = z.object({
  essential: z.boolean(),
  analytics: z.boolean(),
  ads: z.boolean(),
  preferences: z.boolean(),
})

const preferencesSchema = z.enum(['accepted', 'rejected', 'custom'])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, consent, preferences } = body

    if (action === 'set-consent' && consent) {
      const validatedConsent = consentSchema.parse(consent)
      const cookieConsent: CookieConsent = {
        ...validatedConsent,
        timestamp: Date.now(),
      }

      setCookieConsent(cookieConsent)

      return NextResponse.json({
        success: true,
        message: 'Cookie consent saved',
      })
    }

    if (action === 'set-preferences' && preferences) {
      const validatedPrefs = preferencesSchema.parse(preferences)
      setCookiePreferences(validatedPrefs)

      return NextResponse.json({
        success: true,
        message: 'Cookie preferences saved',
      })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error saving cookie consent:', error)
    return NextResponse.json(
      { error: 'Failed to save cookie consent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const consent = getCookieConsent()

    return NextResponse.json({
      consent,
    })
  } catch (error) {
    console.error('Error fetching cookie consent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cookie consent' },
      { status: 500 }
    )
  }
}

