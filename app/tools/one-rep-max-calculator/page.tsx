import { Metadata } from 'next'
import Link from 'next/link'
import OneRepMaxCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'One Rep Max Calculator - 1RM Calculator',
  description: 'Calculate your one-rep max (1RM) based on your current lifting performance. Free 1RM calculator using the Epley formula.',
  keywords: ['1RM calculator', 'one rep max', 'max calculator', 'strength calculator', 'lifting calculator'],
  openGraph: {
    title: 'One Rep Max Calculator - StrengthGuide',
    description: 'Calculate your one-rep max (1RM) based on your current lifting performance.',
    url: `${baseUrl}/tools/one-rep-max-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/one-rep-max-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is One Rep Max (1RM)?</h2>
    <p className="text-gray-700 mb-4">
      Your one-rep max (1RM) is the maximum amount of weight you can lift for a single repetition of a given exercise. It's a fundamental measure of strength and is used to program training loads, track progress, and determine training percentages for different rep ranges.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is 1RM Calculated?</h3>
    <p className="text-gray-700 mb-4">
      This calculator uses the Epley formula, which estimates your 1RM based on the weight you can lift for multiple reps. The formula is:
    </p>
    <p className="text-gray-700 mb-4 font-mono bg-gray-100 p-3 rounded">
      1RM = Weight × (1 + Reps/30)
    </p>
    <p className="text-gray-700 mb-4">
      This formula is most accurate for reps between 1-10. For higher rep ranges, the estimate becomes less reliable.
    </p>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why is 1RM Important?</h3>
    <p className="text-gray-700 mb-4">
      Knowing your 1RM helps you:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Program Training:</strong> Use percentages of 1RM to determine training loads (e.g., 75% of 1RM for strength training)</li>
      <li><strong>Track Progress:</strong> Monitor strength gains over time</li>
      <li><strong>Prevent Injury:</strong> Avoid attempting true 1RM tests too frequently</li>
      <li><strong>Plan Workouts:</strong> Structure sets and reps based on your strength level</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Training Percentages</h3>
    <p className="text-gray-700 mb-4">
      Use your 1RM to guide your training:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>90-100% of 1RM:</strong> Maximal strength (1-3 reps)</li>
      <li><strong>80-90% of 1RM:</strong> Strength (3-5 reps)</li>
      <li><strong>70-80% of 1RM:</strong> Hypertrophy/Strength (6-8 reps)</li>
      <li><strong>60-70% of 1RM:</strong> Hypertrophy (8-12 reps)</li>
      <li><strong>50-60% of 1RM:</strong> Endurance (12+ reps)</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Safety Note</h3>
    <p className="text-gray-700 mb-4">
      Never attempt a true 1RM without proper warm-up, technique, and a spotter. Use this calculator to estimate your 1RM from submaximal loads, which is safer and less taxing on your nervous system.
    </p>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Once you know your 1RM, use our <Link href="/tools/training-volume-calculator" className="text-primary-600 hover:text-primary-700 underline">Training Volume Calculator</Link> to track your total work volume. For muscle growth, ensure adequate <Link href="/tools/protein-calculator" className="text-primary-600 hover:text-primary-700 underline">protein intake</Link>.
    </p>
  </>
)

export default function OneRepMaxCalculatorPage() {
  return <OneRepMaxCalculatorClient content={content} />
}
