import { Metadata } from 'next'
import Link from 'next/link'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about StrengthGuide - your trusted source for fitness, nutrition, and strength training advice. Meet our team of certified trainers and nutritionists.',
  openGraph: {
    title: 'About Us - StrengthGuide',
    description: 'Learn about StrengthGuide - your trusted source for fitness, nutrition, and strength training advice.',
    url: `${baseUrl}/about`,
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            About StrengthGuide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Your trusted source for evidence-based fitness, nutrition, and strength training advice.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Mission */}
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              Our Mission
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-4">
                At StrengthGuide, we're dedicated to providing you with accurate, evidence-based information 
                about fitness, nutrition, and strength training. Our mission is to help you achieve 
                your health and fitness goals through expert guidance, practical tips, and actionable 
                advice.
              </p>
              <p className="text-lg text-gray-700">
                We believe that everyone deserves access to quality fitness information, regardless of 
                their experience level or background. Whether you're just starting your fitness journey 
                or you're an experienced athlete, we're here to support you every step of the way.
              </p>
            </div>
          </section>

          {/* What We Do */}
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              What We Do
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Expert Articles
                </h3>
                <p className="text-gray-700">
                  Our team of certified trainers and nutritionists write comprehensive articles covering 
                  topics from muscle building and fat loss to nutrition and recovery.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Workout Plans
                </h3>
                <p className="text-gray-700">
                  We provide ready-to-use workout plans for different fitness levels and goals, 
                  from beginner routines to advanced training programs.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Nutrition Guidance
                </h3>
                <p className="text-gray-700">
                  Learn about proper nutrition, meal planning, and supplementation strategies 
                  to fuel your fitness journey.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Community Support
                </h3>
                <p className="text-gray-700">
                  Join thousands of fitness enthusiasts sharing their experiences, asking questions, 
                  and supporting each other's goals.
                </p>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              Our Values
            </h2>
            <div className="prose prose-lg max-w-none">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-3 font-bold">✓</span>
                  <span>
                    <strong>Evidence-Based:</strong> All our content is backed by scientific research 
                    and real-world experience from certified professionals.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-3 font-bold">✓</span>
                  <span>
                    <strong>Accessibility:</strong> We believe fitness should be accessible to everyone, 
                    regardless of their background or experience level.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-3 font-bold">✓</span>
                  <span>
                    <strong>Honesty:</strong> We provide honest, transparent information without 
                    gimmicks or misleading claims.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-3 font-bold">✓</span>
                  <span>
                    <strong>Support:</strong> We're committed to supporting our community in achieving 
                    their fitness goals.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-xl p-8 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-lg mb-6 text-primary-100">
              Explore our articles, workout plans, and nutrition guides to get started today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-bold"
              >
                Browse Articles
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-bold"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* FAQ Section */}
        <FAQSection
          faqs={[
            {
              question: 'Who runs StrengthGuide?',
              answer: 'StrengthGuide is run by a team of certified fitness professionals, nutritionists, and health experts dedicated to providing evidence-based fitness information.',
            },
            {
              question: 'Is StrengthGuide free to use?',
              answer: 'Yes! All our articles, calculators, and resources are completely free. No subscription or sign-up required to access our content.',
            },
            {
              question: 'How do you ensure content quality?',
              answer: 'All our articles are written by qualified professionals and reviewed for accuracy. We base our content on scientific research and fitness industry best practices.',
            },
            {
              question: 'Can I contribute content?',
              answer: 'We welcome contributions from qualified fitness professionals. Please contact us through our contact page with your credentials and topic ideas.',
            },
            {
              question: 'Do you offer personal training?',
              answer: 'We focus on providing free educational content. For personalized training programs, we recommend consulting with a certified personal trainer in your area.',
            },
          ]}
        />
      </div>
    </div>
  )
}

