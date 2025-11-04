import { Metadata } from 'next'
import Link from 'next/link'
import TrainingVolumeCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Training Volume Calculator',
  description: 'Calculate your total training volume (sets × reps × weight) for any exercise. Free training volume calculator.',
  keywords: ['training volume calculator', 'volume calculator', 'sets reps weight', 'workout volume'],
  openGraph: {
    title: 'Training Volume Calculator - StrengthGuide',
    description: 'Calculate your total training volume (sets × reps × weight) for any exercise.',
    url: `${baseUrl}/tools/training-volume-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/training-volume-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Training Volume?</h2>
    <p className="text-gray-700 mb-4">
      Training volume is the total amount of work you perform in a workout or training session. It's calculated by multiplying sets × reps × weight. Volume is a key training variable that, along with intensity and frequency, determines your training stimulus and ultimately your results.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is Training Volume Calculated?</h3>
    <p className="text-gray-700 mb-4">
      Training volume is calculated using the formula:
    </p>
    <p className="text-gray-700 mb-4 font-mono bg-gray-100 p-3 rounded">
      Volume = Sets × Reps × Weight
    </p>
    <p className="text-gray-700 mb-4">
      For example, if you do 3 sets of 10 reps with 100 lbs, your total volume would be 3 × 10 × 100 = 3,000 lbs.
    </p>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why Track Training Volume?</h3>
    <p className="text-gray-700 mb-4">
      Tracking volume helps you:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Monitor Progress:</strong> See if you're gradually increasing your work capacity</li>
      <li><strong>Plan Workouts:</strong> Structure your training to progressively overload</li>
      <li><strong>Avoid Overtraining:</strong> Monitor total volume to prevent excessive fatigue</li>
      <li><strong>Optimize Results:</strong> Ensure you're in the optimal volume range for your goals</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Optimal Volume Ranges</h3>
    <p className="text-gray-700 mb-4">
      Research suggests optimal volume ranges per muscle group per week:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Beginners:</strong> 10-12 sets per muscle group per week</li>
      <li><strong>Intermediate:</strong> 12-16 sets per muscle group per week</li>
      <li><strong>Advanced:</strong> 16-20+ sets per muscle group per week</li>
      <li><strong>Strength Focus:</strong> Lower volume (10-15 sets) with higher intensity</li>
      <li><strong>Hypertrophy Focus:</strong> Higher volume (15-20 sets) with moderate intensity</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Progressive Overload</h3>
    <p className="text-gray-700 mb-4">
      To continue making progress, gradually increase your training volume over time through:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>More Weight:</strong> Increase load while keeping sets/reps the same</li>
      <li><strong>More Reps:</strong> Add reps while keeping sets/weight the same</li>
      <li><strong>More Sets:</strong> Add sets while keeping reps/weight the same</li>
      <li><strong>Better Form:</strong> Improved technique increases effective volume</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Recovery Considerations</h3>
    <p className="text-gray-700 mb-4">
      Remember that more volume requires more recovery:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Rest Days:</strong> Allow 48-72 hours between training the same muscle groups</li>
      <li><strong>Sleep:</strong> Aim for 7-9 hours of quality sleep</li>
      <li><strong>Nutrition:</strong> Ensure adequate protein and total calories</li>
      <li><strong>Deload Weeks:</strong> Reduce volume every 4-6 weeks to prevent overtraining</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Use your <Link href="/tools/one-rep-max-calculator" className="text-primary-600 hover:text-primary-700 underline">One Rep Max Calculator</Link> to determine training loads based on percentages of your 1RM. Ensure adequate <Link href="/tools/protein-calculator" className="text-primary-600 hover:text-primary-700 underline">protein intake</Link> to support muscle recovery and growth from your training volume.
    </p>
  </>
)

export default function TrainingVolumeCalculatorPage() {
  return <TrainingVolumeCalculatorClient content={content} />
}
