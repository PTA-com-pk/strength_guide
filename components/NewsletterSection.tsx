'use client'

import { useState, FormEvent } from 'react'

interface NewsletterSectionProps {
  title?: string
  description?: string
  variant?: 'default' | 'compact'
}

export default function NewsletterSection({ 
  title = 'Get Weekly Fitness Tips Delivered to Your Inbox',
  description = 'Join thousands of fitness enthusiasts getting expert advice, workout plans, and nutrition tips every week.',
  variant = 'default'
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setSubmitted(true)
      setEmail('')
      setIsSubmitting(false)
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (variant === 'compact') {
    return (
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 md:p-8 text-white my-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            {title}
          </h2>
          <p className="text-primary-100 mb-6 text-lg">
            {description}
          </p>
          {submitted ? (
            <div className="bg-green-500/20 border border-green-300 rounded-lg p-4 mb-4">
              <p className="text-green-100 font-semibold">
                ✓ Thank you for subscribing! Check your email to confirm.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              {error && (
                <div className="col-span-full bg-red-500/20 border border-red-300 rounded-lg p-3 mb-2">
                  <p className="text-red-100 text-sm font-semibold">
                    {error}
                  </p>
                </div>
              )}
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                required
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 min-h-[48px] rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Email address for newsletter subscription"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 min-h-[48px] bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Subscribe to newsletter"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          <p className="text-xs text-primary-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-16 mt-12 rounded-lg shadow-lg">
      <div className="container mx-auto px-4 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          {title}
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        {submitted ? (
          <div className="max-w-md mx-auto bg-green-500/20 border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-green-100 font-semibold">
              ✓ Thank you for subscribing! Check your email to confirm.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            {error && (
              <div className="col-span-full bg-red-500/20 border border-red-300 rounded-lg p-3 mb-2">
                <p className="text-red-100 text-sm font-semibold">
                  {error}
                </p>
              </div>
            )}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              required
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 min-h-[48px] rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Email address for newsletter subscription"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 min-h-[48px] bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Subscribe to newsletter"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
        )}
        <p className="text-sm text-primary-200 mt-4">
          No spam. Unsubscribe anytime. 🎁 Free workout guide included!
        </p>
      </div>
    </section>
  )
}

