import { Metadata } from 'next'
import Link from 'next/link'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read StrengthGuide\'s privacy policy to understand how we collect, use, and protect your personal information.',
  openGraph: {
    title: 'Privacy Policy - StrengthGuide',
    description: 'Read StrengthGuide\'s privacy policy to understand how we collect, use, and protect your personal information.',
    url: `${baseUrl}/privacy`,
  },
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
}

export default function PrivacyPage() {
  const lastUpdated = 'January 1, 2024'

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Privacy Policy
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
                  Introduction
                </h2>
                <p className="text-gray-700 mb-4">
                  At StrengthGuide ("we," "our," or "us"), we are committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                  information when you visit our website and use our services.
                </p>
                <p className="text-gray-700">
                  By using StrengthGuide, you agree to the collection and use of information in accordance 
                  with this policy. If you do not agree with our policies and practices, please do not 
                  use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Information We Collect
                </h2>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Personal Information
                </h3>
                <p className="text-gray-700 mb-4">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Register for an account</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Submit comments or contact forms</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  This information may include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Name and email address</li>
                  <li>Profile information (if you create an account)</li>
                  <li>Preferences and interests</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">
                  Automatically Collected Information
                </h3>
                <p className="text-gray-700 mb-4">
                  When you visit our website, we automatically collect certain information about your 
                  device and browsing behavior, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages you visit and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Device information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Send you newsletters and updates (with your consent)</li>
                  <li>Respond to your comments and inquiries</li>
                  <li>Personalize your experience on our website</li>
                  <li>Analyze usage patterns and trends</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar tracking technologies to track activity on our website 
                  and store certain information. Cookies are files with a small amount of data that 
                  may include an anonymous unique identifier.
                </p>
                <p className="text-gray-700 mb-4">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie 
                  is being sent. However, if you do not accept cookies, you may not be able to use 
                  some portions of our website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Third-Party Services
                </h2>
                <p className="text-gray-700 mb-4">
                  We may use third-party services to help us operate our website and analyze how 
                  our website is used. These third parties may have access to your personal 
                  information only to perform these tasks on our behalf and are obligated not to 
                  disclose or use it for any other purpose.
                </p>
                <p className="text-gray-700">
                  Our website may contain links to third-party websites. We are not responsible for 
                  the privacy practices of these external sites. We encourage you to review the 
                  privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Data Security
                </h2>
                <p className="text-gray-700 mb-4">
                  We implement appropriate technical and organizational security measures to protect 
                  your personal information. However, no method of transmission over the Internet 
                  or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Your Rights
                </h2>
                <p className="text-gray-700 mb-4">
                  Depending on your location, you may have certain rights regarding your personal 
                  information, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to object to processing of your information</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="text-gray-700">
                  To exercise these rights, please contact us using the information provided in 
                  the Contact section below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Children's Privacy
                </h2>
                <p className="text-gray-700">
                  Our services are not intended for individuals under the age of 13. We do not 
                  knowingly collect personal information from children under 13. If you are a parent 
                  or guardian and believe your child has provided us with personal information, 
                  please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Changes to This Privacy Policy
                </h2>
                <p className="text-gray-700">
                  We may update our Privacy Policy from time to time. We will notify you of any 
                  changes by posting the new Privacy Policy on this page and updating the "Last 
                  updated" date. You are advised to review this Privacy Policy periodically for 
                  any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li>Email: privacy@strengthguide.net</li>
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
      question: 'What information do you collect?',
      answer: 'We collect information you voluntarily provide (name, email when registering or subscribing) and automatically collected data (IP address, browser type, pages visited) to improve our services.',
    },
    {
      question: 'How do you use my information?',
      answer: 'We use your information to provide and improve our services, send newsletters (with consent), respond to inquiries, and analyze website usage. We never sell your personal information.',
    },
    {
      question: 'Do you use cookies?',
      answer: 'Yes, we use cookies to enhance your experience, analyze site usage, and for advertising purposes. You can manage cookie preferences through our cookie settings.',
    },
    {
      question: 'How is my data protected?',
      answer: 'We implement appropriate security measures to protect your information. However, no method of transmission over the Internet is 100% secure, so we cannot guarantee absolute security.',
    },
    {
      question: 'Can I delete my account and data?',
      answer: 'Yes! You can delete your account at any time from your account settings. You can also contact us to request deletion of your personal information.',
    },
  ]}
/>
      </div>
    </div>
  )
}

