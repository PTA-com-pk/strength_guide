import { Metadata } from 'next'
import Link from 'next/link'
import CalorieDeficitCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Calorie Deficit Calculator',
  description: 'Calculate the optimal calorie deficit for safe and sustainable weight loss. Free calorie deficit calculator.',
  keywords: ['calorie deficit calculator', 'weight loss calculator', 'calorie calculator', 'deficit calculator'],
  openGraph: {
    title: 'Calorie Deficit Calculator - StrengthGuide',
    description: 'Calculate the optimal calorie deficit for safe and sustainable weight loss.',
    url: `${baseUrl}/tools/calorie-deficit-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/calorie-deficit-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Calorie Deficit?</h2>
    <p className="text-gray-700 mb-4">
      A calorie deficit occurs when you consume fewer calories than your body burns. This energy imbalance forces your body to use stored fat (and sometimes muscle) for fuel, resulting in weight loss. Creating the right-sized deficit is crucial for sustainable, healthy weight loss without sacrificing muscle mass or energy levels.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How Much Deficit is Safe?</h3>
    <p className="text-gray-700 mb-4">
      The ideal calorie deficit depends on your goals and current weight:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Moderate Deficit (500 calories/day):</strong> Lose ~1 lb per week - sustainable and recommended</li>
      <li><strong>Large Deficit (750-1000 calories/day):</strong> Lose 1.5-2 lbs per week - faster but harder to maintain</li>
      <li><strong>Small Deficit (250 calories/day):</strong> Lose ~0.5 lb per week - slow but very sustainable</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Safety Guidelines</h3>
    <p className="text-gray-700 mb-4">
      Important safety considerations:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Minimum Calories:</strong> Never go below 1200 calories/day (women) or 1500 calories/day (men)</li>
      <li><strong>Preserve Muscle:</strong> Ensure adequate protein intake (1.6-2.2g per kg body weight) during deficit</li>
      <li><strong>Strength Training:</strong> Continue resistance training to maintain muscle mass</li>
      <li><strong>Hydration:</strong> Drink plenty of water to support metabolism and recovery</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Creating Your Deficit</h3>
    <p className="text-gray-700 mb-4">
      You can create a calorie deficit through:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Diet Only:</strong> Reduce calorie intake without changing activity</li>
      <li><strong>Exercise Only:</strong> Increase calorie burn through activity (harder to sustain)</li>
      <li><strong>Combined Approach:</strong> Moderate reduction in calories + moderate increase in activity (recommended)</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Tracking Progress</h3>
    <p className="text-gray-700 mb-4">
      Monitor your progress and adjust as needed:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Weekly Weigh-ins:</strong> Track weight trends, not daily fluctuations</li>
      <li><strong>Body Measurements:</strong> Measure waist, hips, and other areas</li>
      <li><strong>Energy Levels:</strong> If you're constantly tired, the deficit may be too large</li>
      <li><strong>Reassess Monthly:</strong> Adjust deficit as you lose weight (your TDEE decreases)</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      First, calculate your <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE</Link> to know your maintenance calories. Then use our <Link href="/tools/macros-calculator" className="text-primary-600 hover:text-primary-700 underline">Macros Calculator</Link> to ensure you're getting enough protein and balanced nutrition during your deficit.
    </p>
  </>
)

export default function CalorieDeficitCalculatorPage() {
  return <CalorieDeficitCalculatorClient content={content} />
}
