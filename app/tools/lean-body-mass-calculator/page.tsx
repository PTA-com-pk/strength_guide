import { Metadata } from 'next'
import Link from 'next/link'
import LeanBodyMassCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Lean Body Mass Calculator',
  description: 'Calculate your lean body mass (LBM) - total weight minus body fat. Free lean body mass calculator.',
  keywords: ['lean body mass calculator', 'LBM calculator', 'lean mass', 'body composition calculator'],
  openGraph: {
    title: 'Lean Body Mass Calculator - StrengthGuide',
    description: 'Calculate your lean body mass (LBM) - total weight minus body fat.',
    url: `${baseUrl}/tools/lean-body-mass-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/lean-body-mass-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Lean Body Mass (LBM)?</h2>
    <p className="text-gray-700 mb-4">
      Lean Body Mass (LBM) is everything in your body except fat. It includes muscle, bones, organs, water, and other non-fat tissues. Your LBM is a key indicator of your body composition and is more informative than total body weight alone. Tracking LBM helps you understand whether weight changes are from muscle gain/loss or fat gain/loss.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is LBM Calculated?</h3>
    <p className="text-gray-700 mb-4">
      Lean Body Mass is calculated using the formula:
    </p>
    <p className="text-gray-700 mb-4 font-mono bg-gray-100 p-3 rounded">
      LBM = Total Weight - (Total Weight × Body Fat % / 100)
    </p>
    <p className="text-gray-700 mb-4">
      For example, if you weigh 180 lbs with 15% body fat, your LBM would be 180 - (180 × 0.15) = 153 lbs.
    </p>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why is LBM Important?</h3>
    <p className="text-gray-700 mb-4">
      Understanding your LBM helps you:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Track Body Composition:</strong> See if you're gaining muscle or losing fat</li>
      <li><strong>Assess Progress:</strong> Monitor changes that the scale doesn't show (body recomposition)</li>
      <li><strong>Nutrition Planning:</strong> Some nutrition plans use LBM to calculate protein needs</li>
      <li><strong>Metabolic Health:</strong> Higher LBM generally means higher metabolism</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Increasing Lean Body Mass</h3>
    <p className="text-gray-700 mb-4">
      To increase your LBM (primarily muscle mass):
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Resistance Training:</strong> Lift weights 3-4 times per week with progressive overload</li>
      <li><strong>Adequate Protein:</strong> Consume 1.6-2.2g of protein per kg body weight daily</li>
      <li><strong>Calorie Surplus:</strong> Eat 300-500 calories above TDEE for muscle growth</li>
      <li><strong>Recovery:</strong> Get 7-9 hours of sleep and allow muscle groups 48 hours between sessions</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Body Recomposition</h3>
    <p className="text-gray-700 mb-4">
      Body recomposition is the process of simultaneously losing fat and gaining muscle. This results in improved body composition without significant weight change. It's possible when:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li>Eating at maintenance calories or a small deficit</li>
      <li>Following a progressive resistance training program</li>
      <li>Consuming adequate protein</li>
      <li>Having patience (this process takes time)</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      To build muscle, ensure adequate <Link href="/tools/protein-calculator" className="text-primary-600 hover:text-primary-700 underline">protein intake</Link> and track your <Link href="/tools/training-volume-calculator" className="text-primary-600 hover:text-primary-700 underline">training volume</Link>. Use the <Link href="/tools/body-fat-calculator" className="text-primary-600 hover:text-primary-700 underline">Body Fat Calculator</Link> to track changes in body composition over time.
    </p>
  </>
)

export default function LeanBodyMassCalculatorPage() {
  return <LeanBodyMassCalculatorClient content={content} />
}
