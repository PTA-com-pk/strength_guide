'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { isAdmin, getUser } from '@/lib/auth'

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ensure component only runs on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Wait for component to mount
    if (!mounted || typeof window === 'undefined') return

    // Check admin status
    const adminStatus = isAdmin()

    // Don't show popup for admins
    if (adminStatus) {
      return
    }

    // Check if user has already seen the popup in this session
    const popupShown = sessionStorage.getItem('newsletterPopupShown')

    if (popupShown) {
      return
    }

    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasShown(true)
      sessionStorage.setItem('newsletterPopupShown', 'true')
    }, 3000)

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true)
        setHasShown(true)
        sessionStorage.setItem('newsletterPopupShown', 'true')
      }
    }

    // Scroll-based trigger (after scrolling 50% of page)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      if (scrollPercent > 50 && !hasShown) {
        setIsOpen(true)
        setHasShown(true)
        sessionStorage.setItem('newsletterPopupShown', 'true')
      }
    }

    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasShown, mounted])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !email.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setEmail('')
      setIsOpen(false)
      setIsSubmitting(false)
      // Mark popup as shown
      sessionStorage.setItem('newsletterPopupShown', 'true')
    } catch (err: any) {
      console.error('Newsletter subscription error:', err)
      setIsSubmitting(false)
      // Show error but don't close popup - let user try again
      alert(err.message || 'Failed to subscribe. Please try again.')
    }
  }

  // Don't render popup for admins
  const adminCheck = isAdmin()
  if (adminCheck) {
    return null
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col md:flex-row my-auto">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1 shadow-md"
            aria-label="Close popup"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Hero Image - Left Side */}
          <div className="relative w-full md:w-1/2 h-40 md:h-auto md:min-h-[300px]">
            <Image
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
              alt="Fitness workout"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:from-black/50" />
          </div>

          {/* Content - Right Side */}
          <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 md:mb-3">
                Get Free Workouts Weekly! 💪
              </h2>
              <p className="text-gray-700 text-base md:text-lg mb-1 md:mb-2">
                Join 100,000+ fitness enthusiasts
              </p>
              <p className="text-gray-600 text-sm md:text-base">
                Get expert tips, workout plans, and nutrition advice delivered to your inbox every week.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 min-h-[44px] md:min-h-[48px] border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-gray-900 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Email address for newsletter subscription"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 md:px-6 py-2.5 md:py-3 min-h-[44px] md:min-h-[48px] bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold rounded-lg transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Subscribe to newsletter"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-2 md:mt-4">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

