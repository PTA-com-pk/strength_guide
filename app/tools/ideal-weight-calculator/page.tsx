import { Metadata } from 'next'
import Link from 'next/link'
import IdealWeightCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Ideal Weight Calculator',
  description: 'Calculate your ideal body weight based on height, gender, and body frame. Free ideal weight calculator.',
  keywords: ['ideal weight calculator', 'ideal body weight', 'weight calculator', 'health calculator'],
  openGraph: {
    title: 'Ideal Weight Calculator - StrengthGuide',
    description: 'Calculate your ideal body weight based on height, gender, and body frame.',
    url: `${baseUrl}/tools/ideal-weight-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/ideal-weight-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Ideal Weight?</h2>
    <p className="text-gray-700 mb-4">
      Ideal weight is an estimate of the weight range at which you're likely to be healthiest based on your height, gender, and body frame. This calculator uses established formulas (Robinson, Miller, Devine, and Hamwi) to provide a range that accounts for individual differences in body composition.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is Ideal Weight Calculated?</h3>
    <p className="text-gray-700 mb-4">
      The calculator uses different formulas for men and women:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Men:</strong> Based on height with gender-specific multipliers</li>
      <li><strong>Women:</strong> Uses formulas adjusted for typical female body composition</li>
      <li><strong>Body Frame:</strong> Accounts for small, medium, and large frame sizes</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Understanding Your Ideal Weight Range</h3>
    <p className="text-gray-700 mb-4">
      Your ideal weight range provides a target zone, but remember:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Muscle Mass:</strong> Athletes may weigh more than the range but still be healthy due to higher muscle mass</li>
      <li><strong>Body Composition:</strong> Two people at the same weight can have very different body fat percentages</li>
      <li><strong>Individual Variation:</strong> Genetics, bone density, and muscle mass affect ideal weight</li>
      <li><strong>Health Indicators:</strong> Focus on body fat percentage, waist circumference, and overall health markers</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Setting Realistic Goals</h3>
    <p className="text-gray-700 mb-4">
      When working toward your ideal weight:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Gradual Approach:</strong> Aim for 0.5-1 lb per week of weight change</li>
      <li><strong>Sustainable Methods:</strong> Focus on lifestyle changes, not crash diets</li>
      <li><strong>Body Composition:</strong> Consider building muscle while losing fat (body recomposition)</li>
      <li><strong>Health First:</strong> Prioritize overall health markers over a specific number on the scale</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      For a more accurate assessment, use our <Link href="/tools/body-fat-calculator" className="text-primary-600 hover:text-primary-700 underline">Body Fat Calculator</Link> to measure body composition. Calculate your <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE</Link> to plan your nutrition, or use the <Link href="/tools/calorie-deficit-calculator" className="text-primary-600 hover:text-primary-700 underline">Calorie Deficit Calculator</Link> for weight loss planning.
    </p>
  </>
)

export default function IdealWeightCalculatorPage() {
  return <IdealWeightCalculatorClient content={content} />
}
