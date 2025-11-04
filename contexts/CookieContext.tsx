'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CookieConsent, CookiePreferences, clientCookieUtils } from '@/lib/cookies'

interface CookieContextType {
  consent: CookieConsent | null
  preferences: CookiePreferences | null
  showBanner: boolean
  showSettings: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (consent: CookieConsent) => void
  openSettings: () => void
  closeSettings: () => void
  hasConsentFor: (category: keyof Omit<CookieConsent, 'timestamp'>) => boolean
}

const CookieContext = createContext<CookieContextType | undefined>(undefined)

export function CookieProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Check for existing consent
    const existingConsent = clientCookieUtils.getConsent()
    const existingPrefs = clientCookieUtils.get('cookie_preferences') as CookiePreferences | null

    if (existingConsent) {
      setConsent(existingConsent)
      setPreferences(existingPrefs)
      setShowBanner(false)
    } else {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    const newConsent: CookieConsent = {
      essential: true,
      analytics: true,
      ads: true,
      preferences: true,
      timestamp: Date.now(),
    }

    clientCookieUtils.setConsent(newConsent)
    clientCookieUtils.set('cookie_preferences', 'accepted', {
      maxAge: 365 * 24 * 60 * 60,
      secure: true,
      sameSite: 'lax',
    })

    setConsent(newConsent)
    setPreferences('accepted')
    setShowBanner(false)
    setShowSettings(false)

    // Trigger page reload to load analytics/ads scripts
    window.location.reload()
  }

  const rejectNonEssential = () => {
    const newConsent: CookieConsent = {
      essential: true,
      analytics: false,
      ads: false,
      preferences: false,
      timestamp: Date.now(),
    }

    clientCookieUtils.setConsent(newConsent)
    clientCookieUtils.set('cookie_preferences', 'rejected', {
      maxAge: 365 * 24 * 60 * 60,
      secure: true,
      sameSite: 'lax',
    })

    setConsent(newConsent)
    setPreferences('rejected')
    setShowBanner(false)
    setShowSettings(false)
  }

  const savePreferences = (newConsent: CookieConsent) => {
    clientCookieUtils.setConsent(newConsent)
    clientCookieUtils.set('cookie_preferences', 'custom', {
      maxAge: 365 * 24 * 60 * 60,
      secure: true,
      sameSite: 'lax',
    })

    setConsent(newConsent)
    setPreferences('custom')
    setShowBanner(false)
    setShowSettings(false)

    // Trigger page reload to apply changes
    window.location.reload()
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  const hasConsentFor = (category: keyof Omit<CookieConsent, 'timestamp'>): boolean => {
    if (!consent) return false
    if (category === 'essential') return true
    return consent[category] === true
  }

  return (
    <CookieContext.Provider
      value={{
        consent,
        preferences,
        showBanner,
        showSettings,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openSettings,
        closeSettings,
        hasConsentFor,
      }}
    >
      {children}
    </CookieContext.Provider>
  )
}

export function useCookie() {
  const context = useContext(CookieContext)
  if (context === undefined) {
    throw new Error('useCookie must be used within a CookieProvider')
  }
  return context
}

