'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real application, you would send this to your API
    // For now, we'll just simulate a submission
    setTimeout(() => {
      setSubmitted(true)
      setIsSubmitting(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    }, 1000)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                Send Us a Message
              </h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-semibold">
                    ✓ Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="article">Article Suggestion</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                    <a
                      href="mailto:contact@strengthguide.net"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      contact@strengthguide.net
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
                    <p className="text-gray-700">
                      We typically respond within 24-48 hours during business days.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        
        </div>
          {/* Newsletter Section */}
          <NewsletterSection />

          {/* FAQ Section */}
          <FAQSection
            faqs={[
              {
                question: 'Can I contribute an article?',
                answer: 'Yes! We welcome guest contributions from qualified fitness professionals. Please use the contact form and select "Article Suggestion" as the subject.',
              },
              {
                question: 'Do you offer personal training?',
                answer: 'We focus on providing free educational content. For personalized training, we recommend consulting with a certified personal trainer in your area.',
              },
              {
                question: 'How can I advertise on StrengthGuide?',
                answer: 'For advertising and partnership opportunities, please contact us with "Partnership" as the subject.',
              },
              {
                question: 'How quickly will I receive a response?',
                answer: 'We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please mention it in your message.',
              },
              {
                question: 'Can I request a specific article topic?',
                answer: 'Absolutely! We welcome topic suggestions. Use the contact form and select "Article Suggestion" to share your ideas with us.',
              },
            ]}
          />
      </div>
    </div>
  )
}

