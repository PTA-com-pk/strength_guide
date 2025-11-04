'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="StrengthGuide Logo"
            width={200}
            height={120}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="text-6xl font-black text-red-600 mb-4">Oops!</h1>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Something Went Wrong
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={reset}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-black text-gray-900 mb-4">
            Need Help?
          </h3>
          <div className="space-y-3 text-left">
            <Link
              href="/contact"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-bold text-gray-900 mb-1">Contact Support</h4>
              <p className="text-sm text-gray-600">Get help from our team</p>
            </Link>
            <Link
              href="/articles"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-bold text-gray-900 mb-1">Browse Articles</h4>
              <p className="text-sm text-gray-600">Explore our fitness content</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


