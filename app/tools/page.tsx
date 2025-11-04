import { Metadata } from 'next'
import Link from 'next/link'
import NewsletterSection from '@/components/NewsletterSection'
import FAQSection from '@/components/FAQSection'
import Image from 'next/image'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Fitness Tools & Calculators',
  description: 'Free fitness calculators and tools: BMR calculator, TDEE calculator, body fat calculator, protein calculator, one rep max calculator, and more.',
  keywords: ['fitness calculator', 'BMR calculator', 'TDEE calculator', 'body fat calculator', 'protein calculator', 'one rep max calculator', 'BMI calculator'],
  openGraph: {
    title: 'Fitness Tools & Calculators - StrengthGuide',
    description: 'Free fitness calculators and tools to help you achieve your fitness goals.',
    url: `${baseUrl}/tools`,
  },
  alternates: {
    canonical: `${baseUrl}/tools`,
  },
}

const tools = [
  {
    id: 'bmr',
    name: 'BMR Calculator',
    slug: 'bmr-calculator',
    description: 'Calculate your Basal Metabolic Rate (BMR) - the number of calories your body burns at rest.',
    icon: '🔥',
    category: 'Nutrition',
  },
  {
    id: 'tdee',
    name: 'TDEE Calculator',
    slug: 'tdee-calculator',
    description: 'Calculate your Total Daily Energy Expenditure (TDEE) - total calories burned per day.',
    icon: '⚡',
    category: 'Nutrition',
  },
  {
    id: 'protein',
    name: 'Protein Calculator',
    slug: 'protein-calculator',
    description: 'Calculate how much protein you need daily based on your body weight and activity level.',
    icon: '💪',
    category: 'Nutrition',
  },
  {
    id: 'body-fat',
    name: 'Body Fat Calculator',
    slug: 'body-fat-calculator',
    description: 'Estimate your body fat percentage using various measurement methods.',
    icon: '📊',
    category: 'Body Composition',
  },
  {
    id: 'bmi',
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Calculate your Body Mass Index (BMI) to assess your weight category.',
    icon: '📏',
    category: 'Body Composition',
  },
  {
    id: 'one-rep-max',
    name: 'One Rep Max Calculator',
    slug: 'one-rep-max-calculator',
    description: 'Calculate your one-rep max (1RM) based on your current lifting performance.',
    icon: '🏋️',
    category: 'Strength',
  },
  {
    id: 'macros',
    name: 'Macros Calculator',
    slug: 'macros-calculator',
    description: 'Calculate your optimal macronutrient ratios (protein, carbs, fats) for your goals.',
    icon: '🍽️',
    category: 'Nutrition',
  },
  {
    id: 'ideal-weight',
    name: 'Ideal Weight Calculator',
    slug: 'ideal-weight-calculator',
    description: 'Calculate your ideal body weight based on height, gender, and body frame.',
    icon: '⚖️',
    category: 'Body Composition',
  },
  {
    id: 'calorie-deficit',
    name: 'Calorie Deficit Calculator',
    slug: 'calorie-deficit-calculator',
    description: 'Calculate the optimal calorie deficit for safe and sustainable weight loss.',
    icon: '📉',
    category: 'Nutrition',
  },
  {
    id: 'workout-timer',
    name: 'Workout Timer',
    slug: 'workout-timer',
    description: 'Customizable workout timer for rest periods, intervals, and circuit training.',
    icon: '⏱️',
    category: 'Training',
  },
  {
    id: 'volume-calculator',
    name: 'Training Volume Calculator',
    slug: 'training-volume-calculator',
    description: 'Calculate your total training volume (sets × reps × weight) for any exercise.',
    icon: '📈',
    category: 'Strength',
  },
  {
    id: 'lean-body-mass',
    name: 'Lean Body Mass Calculator',
    slug: 'lean-body-mass-calculator',
    description: 'Calculate your lean body mass (LBM) - total weight minus body fat.',
    icon: '🎯',
    category: 'Body Composition',
  },
]

const categories = ['All', 'Nutrition', 'Body Composition', 'Strength', 'Training']

export default function ToolsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Fitness Tools & Calculators
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Free fitness calculators and tools to help you track progress, plan nutrition, and optimize your training.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group block bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{tool.icon}</div>
                  <span className="px-3 py-1 text-xs font-bold text-primary-600 bg-primary-100 rounded-full uppercase">
                    {tool.category}
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {tool.name}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center text-primary-600 font-semibold text-sm">
                  Use Calculator →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
            Why Use Fitness Calculators?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Our free fitness calculators help you make informed decisions about your nutrition and training. 
              Whether you're trying to lose weight, build muscle, or improve performance, these tools provide 
              science-based calculations to guide your journey.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Accurate Calculations</h3>
                <p className="text-gray-600 text-sm">
                  All calculators use proven formulas based on scientific research and fitness industry standards.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Free & Easy to Use</h3>
                <p className="text-gray-600 text-sm">
                  No sign-up required. Simply input your measurements and get instant results.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Track Your Progress</h3>
                <p className="text-gray-600 text-sm">
                  Save your results and track changes over time to monitor your fitness journey.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Evidence-Based</h3>
                <p className="text-gray-600 text-sm">
                  All formulas are based on peer-reviewed research and fitness science.
                </p>
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
              question: 'Are the calculators free to use?',
              answer: 'Yes! All our fitness calculators are 100% free to use. No sign-up required, and you can use them as many times as you need.',
            },
            {
              question: 'How accurate are the calculations?',
              answer: 'Our calculators use scientifically validated formulas that are widely used in the fitness industry. Results are typically accurate within ±5-15% depending on the calculator type.',
            },
            {
              question: 'Do I need to create an account?',
              answer: 'No account is required to use the calculators. However, creating a free account allows you to save your calculation history and track your progress over time.',
            },
            {
              question: 'Can I use multiple calculators together?',
              answer: 'Absolutely! Our calculators are designed to work together. You can start with BMR, move to TDEE, then calculate your macros - the data flows seamlessly between tools.',
            },
            {
              question: 'How often should I recalculate?',
              answer: 'We recommend recalculating whenever your weight changes significantly (10+ lbs), your activity level changes, or every 4-6 weeks during a fitness journey.',
            },
          ]}
        />
      </div>
    </div>
  )
}

