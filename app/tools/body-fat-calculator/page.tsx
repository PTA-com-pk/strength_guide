import { Metadata } from 'next'
import Link from 'next/link'
import BodyFatCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Body Fat Calculator - Body Fat Percentage',
  description: 'Estimate your body fat percentage using various measurement methods. Free body fat calculator for tracking body composition.',
  keywords: ['body fat calculator', 'body fat percentage', 'body composition', 'fat percentage calculator'],
  openGraph: {
    title: 'Body Fat Calculator - StrengthGuide',
    description: 'Estimate your body fat percentage using various measurement methods.',
    url: `${baseUrl}/tools/body-fat-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/body-fat-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Body Fat Percentage?</h2>
    <p className="text-gray-700 mb-4">
      Body fat percentage is the proportion of your total body weight that consists of fat tissue. Unlike BMI, which only considers height and weight, body fat percentage gives you insight into your actual body composition. This is important because two people can have the same weight but very different body fat percentages based on their muscle mass.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is Body Fat Calculated?</h3>
    <p className="text-gray-700 mb-4">
      This calculator uses the U.S. Navy body fat formula, which estimates body fat percentage based on:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Neck Circumference:</strong> Measured below the larynx</li>
      <li><strong>Waist Circumference:</strong> Measured at the navel for men, narrowest point for women</li>
      <li><strong>Hip Circumference:</strong> Required for women, measured at the widest point</li>
      <li><strong>Height and Weight:</strong> Used to refine the calculation</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Body Fat Percentage Categories</h3>
    <p className="text-gray-700 mb-4">
      General guidelines for body fat percentage:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Men:</strong> Essential fat (2-5%), Athletes (6-13%), Fitness (14-17%), Average (18-24%), Obese (25%+)</li>
      <li><strong>Women:</strong> Essential fat (10-13%), Athletes (14-20%), Fitness (21-24%), Average (25-31%), Obese (32%+)</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why Track Body Fat?</h3>
    <p className="text-gray-700 mb-4">
      Monitoring body fat percentage helps you:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Assess Progress:</strong> Track changes in body composition, not just weight</li>
      <li><strong>Set Goals:</strong> Establish realistic body fat targets for your fitness goals</li>
      <li><strong>Measure Success:</strong> See improvements even when scale weight doesn't change (body recomposition)</li>
      <li><strong>Health Monitoring:</strong> Higher body fat is associated with increased health risks</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Measurement Tips</h3>
    <p className="text-gray-700 mb-4">
      For accurate measurements:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Consistency:</strong> Measure at the same time of day (morning is best)</li>
      <li><strong>Proper Technique:</strong> Use a flexible measuring tape, measure at the correct locations</li>
      <li><strong>Track Trends:</strong> Focus on changes over time rather than exact numbers</li>
      <li><strong>Re-measure Regularly:</strong> Check every 4-6 weeks to monitor progress</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Once you know your body fat percentage, use our <Link href="/tools/lean-body-mass-calculator" className="text-primary-600 hover:text-primary-700 underline">Lean Body Mass Calculator</Link> to determine your muscle mass. For weight management, calculate your <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE</Link> and ensure adequate <Link href="/tools/protein-calculator" className="text-primary-600 hover:text-primary-700 underline">protein intake</Link>.
    </p>
  </>
)

export default function BodyFatCalculatorPage() {
  return <BodyFatCalculatorClient content={content} />
}
