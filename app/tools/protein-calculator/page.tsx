import { Metadata } from 'next'
import Link from 'next/link'
import ProteinCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Protein Calculator - Daily Protein Needs',
  description: 'Calculate how much protein you need daily based on your body weight, activity level, and fitness goals. Free protein intake calculator.',
  keywords: ['protein calculator', 'protein intake', 'daily protein', 'protein needs', 'fitness calculator'],
  openGraph: {
    title: 'Protein Calculator - StrengthGuide',
    description: 'Calculate how much protein you need daily based on your body weight, activity level, and fitness goals.',
    url: `${baseUrl}/tools/protein-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/protein-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Why is Protein Important?</h2>
    <p className="text-gray-700 mb-4">
      Protein is essential for building and repairing muscle tissue, supporting immune function, producing hormones and enzymes, and maintaining healthy skin, hair, and nails. Adequate protein intake is crucial for anyone looking to build muscle, lose fat, or maintain their current physique.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How Much Protein Do You Need?</h3>
    <p className="text-gray-700 mb-4">
      Protein needs vary based on several factors:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Activity Level:</strong> More active individuals need more protein for muscle repair</li>
      <li><strong>Body Weight:</strong> Protein needs are calculated per kilogram or pound of body weight</li>
      <li><strong>Fitness Goals:</strong> Muscle gain and fat loss require higher protein intake</li>
      <li><strong>Age:</strong> Older adults may need slightly more protein to prevent muscle loss</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Protein Intake Guidelines</h3>
    <p className="text-gray-700 mb-4">
      Research suggests optimal protein intake ranges:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Sedentary:</strong> 1.2-1.4g per kg body weight</li>
      <li><strong>Active:</strong> 1.6-1.8g per kg body weight</li>
      <li><strong>Muscle Building:</strong> 1.8-2.2g per kg body weight</li>
      <li><strong>Fat Loss:</strong> 2.0-2.4g per kg body weight (to preserve muscle)</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Best Protein Sources</h3>
    <p className="text-gray-700 mb-4">
      High-quality protein sources include: lean meats (chicken, turkey, beef), fish (salmon, tuna), eggs, dairy (Greek yogurt, cottage cheese), legumes (beans, lentils), and plant-based options (tofu, tempeh, quinoa).
    </p>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Once you know your protein target, use our <Link href="/tools/macros-calculator" className="text-primary-600 hover:text-primary-700 underline">Macros Calculator</Link> to balance your protein with carbs and fats, or check your <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE</Link> to ensure you're eating enough total calories.
    </p>
  </>
)

export default function ProteinCalculatorPage() {
  return <ProteinCalculatorClient content={content} />
}
