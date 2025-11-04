import { Metadata } from 'next'
import Link from 'next/link'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read StrengthGuide\'s Terms of Service to understand the rules and guidelines for using our website and services.',
  openGraph: {
    title: 'Terms of Service - StrengthGuide',
    description: 'Read StrengthGuide\'s Terms of Service to understand the rules and guidelines for using our website.',
    url: `${baseUrl}/terms`,
  },
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
}

export default function TermsPage() {
  const lastUpdated = 'January 1, 2024'

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 border border-gray-200">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-gray-700 mb-4">
                  By accessing or using StrengthGuide ("the Website"), you agree to be bound by these 
                  Terms of Service ("Terms"). If you disagree with any part of these terms, then 
                  you may not access the Website.
                </p>
                <p className="text-gray-700">
                  These Terms apply to all visitors, users, and others who access or use the Website. 
                  Please read these Terms carefully before using our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Use of the Website
                </h2>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Permitted Use
                </h3>
                <p className="text-gray-700 mb-4">
                  You may use the Website for lawful purposes only. You agree to use the Website 
                  in accordance with these Terms and all applicable laws and regulations.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">
                  Prohibited Activities
                </h3>
                <p className="text-gray-700 mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to the Website</li>
                  <li>Interfere with or disrupt the Website or servers</li>
                  <li>Use the Website for any commercial purpose without our written consent</li>
                  <li>Collect or harvest information about other users</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  User Accounts
                </h2>
                <p className="text-gray-700 mb-4">
                  If you create an account on our Website, you are responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Maintaining the security of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Keeping your account information up to date</li>
                </ul>
                <p className="text-gray-700">
                  You must notify us immediately of any unauthorized use of your account or any 
                  other breach of security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Content and Intellectual Property
                </h2>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Our Content
                </h3>
                <p className="text-gray-700 mb-4">
                  All content on the Website, including text, graphics, logos, images, and software, 
                  is the property of StrengthGuide or its content suppliers and is protected by copyright, 
                  trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">
                  User-Generated Content
                </h3>
                <p className="text-gray-700 mb-4">
                  By submitting content (comments, reviews, etc.) to the Website, you grant us a 
                  non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, 
                  display, and distribute such content.
                </p>
                <p className="text-gray-700 mb-4">
                  You represent and warrant that:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>You own or have the right to submit the content</li>
                  <li>The content does not violate any third-party rights</li>
                  <li>The content is not defamatory, obscene, or otherwise unlawful</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Medical and Health Disclaimer
                </h2>
                <p className="text-gray-700 mb-4">
                  <strong>IMPORTANT:</strong> The content on StrengthGuide is for informational and 
                  educational purposes only and is not intended as medical advice, diagnosis, or 
                  treatment. Always seek the advice of your physician or other qualified health 
                  provider with any questions you may have regarding a medical condition.
                </p>
                <p className="text-gray-700 mb-4">
                  Never disregard professional medical advice or delay in seeking it because of 
                  something you have read on this Website. The information provided is not a 
                  substitute for professional medical care.
                </p>
                <p className="text-gray-700">
                  If you think you may have a medical emergency, call your doctor or emergency 
                  services immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-gray-700 mb-4">
                  To the fullest extent permitted by law, StrengthGuide and its operators shall not be 
                  liable for any indirect, incidental, special, consequential, or punitive damages, 
                  or any loss of profits or revenues, whether incurred directly or indirectly, or 
                  any loss of data, use, goodwill, or other intangible losses resulting from your 
                  use of the Website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Indemnification
                </h2>
                <p className="text-gray-700">
                  You agree to defend, indemnify, and hold harmless StrengthGuide and its operators from 
                  any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses 
                  (including attorney's fees) arising from your use of the Website or violation of 
                  these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Termination
                </h2>
                <p className="text-gray-700 mb-4">
                  We reserve the right to terminate or suspend your account and access to the Website 
                  immediately, without prior notice or liability, for any reason, including if you 
                  breach these Terms.
                </p>
                <p className="text-gray-700">
                  Upon termination, your right to use the Website will cease immediately. All 
                  provisions of these Terms that by their nature should survive termination shall 
                  survive termination.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-gray-700">
                  We reserve the right to modify or replace these Terms at any time. If a revision 
                  is material, we will provide at least 30 days notice prior to any new terms taking 
                  effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Governing Law
                </h2>
                <p className="text-gray-700">
                  These Terms shall be governed by and construed in accordance with the laws of 
                  [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes 
                  arising under or in connection with these Terms shall be subject to the exclusive 
                  jurisdiction of the courts of [Your Jurisdiction].
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li>Email: legal@strengthguide.net</li>
                  <li>
                    <Link href="/contact" className="text-primary-600 hover:text-primary-700">
                      Contact Form
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
          </div>

        </div>
          {/* Newsletter Section */}
          <NewsletterSection />

          {/* FAQ Section */}
          <FAQSection
            faqs={[
              {
                question: 'Do I need to create an account?',
                answer: 'No, creating an account is optional. You can browse articles and use calculators without an account. Accounts allow you to save favorites, leave comments, and track your progress.',
              },
              {
                question: 'Can I share articles from StrengthGuide?',
                answer: 'Yes! You can share our articles using the social share buttons. We encourage sharing helpful content, but please link back to the original article.',
              },
              {
                question: 'Is the content medical advice?',
                answer: 'No. Our content is for informational and educational purposes only. Always consult with a healthcare professional before starting any fitness or nutrition program.',
              },
              {
                question: 'Can I use StrengthGuide content commercially?',
                answer: 'No. All content is protected by copyright. Commercial use requires written permission. See our Terms of Service for details on usage rights.',
              },
              {
                question: 'What happens if I violate the terms?',
                answer: 'We reserve the right to terminate accounts that violate our terms. Repeated violations may result in permanent bans. Please review our Terms of Service for complete details.',
              },
            ]}
          />
        </div>
    </div>
  )
}

