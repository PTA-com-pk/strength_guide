'use client'

import { useCookie } from '@/contexts/CookieContext'
import { CookieConsent } from '@/lib/cookies'
import { useState, useEffect } from 'react'

export default function CookieSettings() {
  const { showSettings, consent, savePreferences, closeSettings } = useCookie()
  const [localConsent, setLocalConsent] = useState<CookieConsent>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    ads: false,
    preferences: false,
    timestamp: Date.now(),
  })

  useEffect(() => {
    if (consent) {
      setLocalConsent(consent)
    }
  }, [consent])

  if (!showSettings) return null

  const handleToggle = (category: keyof Omit<CookieConsent, 'timestamp'>) => {
    if (category === 'essential') return // Cannot disable essential cookies

    setLocalConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleSave = () => {
    savePreferences({
      ...localConsent,
      timestamp: Date.now(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Cookie Preferences
            </h2>
            <button
              onClick={closeSettings}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">
            Manage your cookie preferences. Essential cookies are required for the website to function 
            and cannot be disabled. You can enable or disable other cookie categories below.
          </p>

          {/* Cookie Categories */}
          <div className="space-y-4 mb-6">
            {/* Essential Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Essential Cookies</h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies are necessary for the website to function and cannot be switched off. 
                    They include session management, authentication, and security features.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Analytics Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously. This helps us improve our content and user experience.
                  </p>
                  <p className="text-xs text-gray-500">
                    Examples: Google Analytics, page views, user behavior tracking
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConsent.analytics}
                      onChange={() => handleToggle('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Advertising Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Advertising Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies are used to deliver advertisements relevant to you and your interests. 
                    They also help measure the effectiveness of advertising campaigns.
                  </p>
                  <p className="text-xs text-gray-500">
                    Examples: Google AdSense, Ezoic, personalized ads
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConsent.ads}
                      onChange={() => handleToggle('ads')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Preferences Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Preference Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    These cookies remember your preferences and settings to provide a personalized experience 
                    on our website.
                  </p>
                  <p className="text-xs text-gray-500">
                    Examples: Language preferences, theme settings, region selection
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConsent.preferences}
                      onChange={() => handleToggle('preferences')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={closeSettings}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Save Preferences
            </button>
          </div>

          {/* Legal Links */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              For more information, please read our{' '}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

