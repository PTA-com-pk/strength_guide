'use client'

import { useCookie } from '@/contexts/CookieContext'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectNonEssential, openSettings } = useCookie()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (showBanner) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [showBanner])

  if (!showBanner) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="dialog"
      aria-label="Cookie consent banner"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              We Value Your Privacy
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              We use cookies to personalize content, analyze traffic, and improve your experience. 
              Essential cookies are required for the site to function. You can accept all cookies, 
              reject non-essential cookies, or customize your preferences.
            </p>
            <div className="mt-3">
              <button
                onClick={openSettings}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold underline"
              >
                Learn more about our cookie policy
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={rejectNonEssential}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm whitespace-nowrap"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={openSettings}
              className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm whitespace-nowrap"
            >
              Customize
            </button>
            <button
              onClick={acceptAll}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm whitespace-nowrap"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

