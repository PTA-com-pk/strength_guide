// Types - can be imported anywhere
export type CookieConsent = {
  essential: boolean
  analytics: boolean
  ads: boolean
  preferences: boolean
  timestamp: number
}

export type CookiePreferences = 'accepted' | 'rejected' | 'custom'

export const COOKIE_CONSENT_NAME = 'cookie_consent'
export const COOKIE_PREFERENCES_NAME = 'cookie_preferences'

// Client-side cookie utilities (for use in client components)
export const clientCookieUtils = {
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  },

  set: (
    name: string,
    value: string,
    options: {
      maxAge?: number
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
      path?: string
    } = {}
  ): void => {
    if (typeof document === 'undefined') return

    const maxAge = options.maxAge || 365 * 24 * 60 * 60 // 1 year
    const secure = options.secure !== false && location.protocol === 'https:' ? '; Secure' : ''
    const sameSite = options.sameSite || 'Lax'
    const path = options.path || '/'

    document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite}${secure}`
  },

  delete: (name: string, path: string = '/'): void => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
  },

  getConsent: (): CookieConsent | null => {
    const consent = clientCookieUtils.get(COOKIE_CONSENT_NAME)
    if (!consent) return null

    try {
      return JSON.parse(consent) as CookieConsent
    } catch {
      return null
    }
  },

  setConsent: (consent: CookieConsent): void => {
    clientCookieUtils.set(COOKIE_CONSENT_NAME, JSON.stringify(consent), {
      maxAge: 365 * 24 * 60 * 60,
      secure: true,
      sameSite: 'lax',
    })
  },

  hasConsentFor: (category: keyof Omit<CookieConsent, 'timestamp'>): boolean => {
    const consent = clientCookieUtils.getConsent()
    if (!consent) return false

    if (category === 'essential') return true

    return consent[category] === true
  },
}

