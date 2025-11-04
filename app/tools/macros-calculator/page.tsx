import { Metadata } from 'next'
import Link from 'next/link'
import MacrosCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Macros Calculator - Macronutrient Calculator',
  description: 'Calculate your optimal macronutrient ratios (protein, carbs, fats) for your fitness goals. Free macros calculator.',
  keywords: ['macros calculator', 'macronutrient calculator', 'protein carbs fats', 'macros calculator'],
  openGraph: {
    title: 'Macros Calculator - StrengthGuide',
    description: 'Calculate your optimal macronutrient ratios (protein, carbs, fats) for your fitness goals.',
    url: `${baseUrl}/tools/macros-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/macros-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What are Macros?</h2>
    <p className="text-gray-700 mb-4">
      Macronutrients (macros) are the three main nutrients your body needs in large amounts: protein, carbohydrates, and fats. Each macro provides calories and serves different functions in your body. Balancing these macros is crucial for achieving your fitness goals, whether that's building muscle, losing fat, or maintaining your current physique.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">The Three Macronutrients</h3>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Protein (4 calories/gram):</strong> Essential for muscle repair, growth, and immune function. Should be prioritized in most diets.</li>
      <li><strong>Carbohydrates (4 calories/gram):</strong> Your body's primary energy source. Important for performance and recovery.</li>
      <li><strong>Fats (9 calories/gram):</strong> Supports hormone production, vitamin absorption, and provides sustained energy.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Macro Ratios by Goal</h3>
    <p className="text-gray-700 mb-4">
      Optimal macro ratios vary based on your fitness goals:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Muscle Gain:</strong> Higher carbs (40-50%), moderate protein (25-30%), moderate fats (20-30%)</li>
      <li><strong>Fat Loss:</strong> Higher protein (30-40%), moderate carbs (30-40%), moderate fats (20-30%)</li>
      <li><strong>Maintenance:</strong> Balanced approach (30% protein, 40% carbs, 30% fats)</li>
      <li><strong>Athletic Performance:</strong> Higher carbs (45-55%) for sustained energy</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How to Use Your Macro Targets</h3>
    <p className="text-gray-700 mb-4">
      Once you have your macro targets:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Track Daily:</strong> Use a food tracking app to monitor your intake</li>
      <li><strong>Prioritize Protein:</strong> Meet your protein goal first, then fill in carbs and fats</li>
      <li><strong>Be Flexible:</strong> Aim to hit your targets within ±5-10%</li>
      <li><strong>Adjust as Needed:</strong> Recalculate macros every 4-6 weeks or after significant weight changes</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Make sure you know your <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE</Link> first, as macros are calculated from your total calorie needs. Also check your <Link href="/tools/protein-calculator" className="text-primary-600 hover:text-primary-700 underline">protein requirements</Link> to ensure adequate intake for your goals.
    </p>
  </>
)

export default function MacrosCalculatorPage() {
  return <MacrosCalculatorClient content={content} />
}
