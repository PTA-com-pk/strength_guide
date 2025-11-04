import { cookies } from 'next/headers'
import { CookieConsent, CookiePreferences, COOKIE_CONSENT_NAME, COOKIE_PREFERENCES_NAME } from './cookies'

// Server-side cookie utilities (only use in Server Components/API Routes)
export function getCookie(name: string): string | undefined {
  try {
    return cookies().get(name)?.value
  } catch {
    return undefined
  }
}

export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    path?: string
  } = {}
): void {
  const cookieStore = cookies()
  cookieStore.set(name, value, {
    path: '/',
    maxAge: options.maxAge || 365 * 24 * 60 * 60, // 1 year default
    httpOnly: options.httpOnly ?? false,
    secure: options.secure ?? true,
    sameSite: options.sameSite || 'lax',
    ...options,
  })
}

export function deleteCookie(name: string): void {
  const cookieStore = cookies()
  cookieStore.delete(name)
}

// Cookie consent utilities (server-side)
export function getCookieConsent(): CookieConsent | null {
  const consent = getCookie(COOKIE_CONSENT_NAME)
  if (!consent) return null

  try {
    return JSON.parse(consent) as CookieConsent
  } catch {
    return null
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  setCookie(COOKIE_CONSENT_NAME, JSON.stringify(consent), {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    httpOnly: false, // Needs to be accessible client-side
    secure: true,
    sameSite: 'lax',
  })
}

export function getCookiePreferences(): CookiePreferences | null {
  const prefs = getCookie(COOKIE_PREFERENCES_NAME)
  return (prefs as CookiePreferences) || null
}

export function setCookiePreferences(preferences: CookiePreferences): void {
  setCookie(COOKIE_PREFERENCES_NAME, preferences, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
  })
}

export function hasConsentFor(category: keyof Omit<CookieConsent, 'timestamp'>): boolean {
  const consent = getCookieConsent()
  if (!consent) return false

  // Essential cookies are always allowed
  if (category === 'essential') return true

  return consent[category] === true
}

