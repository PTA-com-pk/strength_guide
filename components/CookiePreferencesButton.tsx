'use client'

import { useCookie } from '@/contexts/CookieContext'

export default function CookiePreferencesButton() {
  const { openSettings } = useCookie()

  return (
    <button
      onClick={openSettings}
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      aria-label="Manage cookie preferences"
    >
      Cookie Preferences
    </button>
  )
}

