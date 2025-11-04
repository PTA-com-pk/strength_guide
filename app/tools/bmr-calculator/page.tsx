import { Metadata } from 'next'
import Link from 'next/link'
import BMRCalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'BMR Calculator - Basal Metabolic Rate',
  description: 'Calculate your Basal Metabolic Rate (BMR) - the number of calories your body burns at rest. Free BMR calculator using the Mifflin-St Jeor equation.',
  keywords: ['BMR calculator', 'basal metabolic rate', 'calorie calculator', 'metabolism calculator', 'fitness calculator'],
  openGraph: {
    title: 'BMR Calculator - StrengthGuide',
    description: 'Calculate your Basal Metabolic Rate (BMR) - the number of calories your body burns at rest.',
    url: `${baseUrl}/tools/bmr-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/bmr-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Basal Metabolic Rate (BMR)?</h2>
    <p className="text-gray-700 mb-4">
      Your Basal Metabolic Rate (BMR) is the number of calories your body burns at rest to maintain basic physiological functions like breathing, circulation, cell production, and brain function. It represents the minimum amount of energy your body needs to survive.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is BMR Calculated?</h3>
    <p className="text-gray-700 mb-4">
      This calculator uses the Mifflin-St Jeor Equation, which is considered one of the most accurate BMR formulas. It takes into account your:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Gender:</strong> Men typically have higher BMR than women due to more muscle mass</li>
      <li><strong>Age:</strong> BMR decreases with age as muscle mass naturally declines</li>
      <li><strong>Weight:</strong> Heavier individuals burn more calories at rest</li>
      <li><strong>Height:</strong> Taller people have higher BMR due to larger body surface area</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why is BMR Important?</h3>
    <p className="text-gray-700 mb-4">
      Understanding your BMR is crucial for:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Weight Management:</strong> Knowing your BMR helps you determine how many calories you need to maintain, lose, or gain weight</li>
      <li><strong>Nutrition Planning:</strong> It's the foundation for calculating your Total Daily Energy Expenditure (TDEE)</li>
      <li><strong>Fitness Goals:</strong> Essential for creating effective diet and workout plans</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Once you know your BMR, multiply it by your activity level to get your Total Daily Energy Expenditure (TDEE). Use our <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE Calculator</Link> to find out how many calories you burn per day including all activities.
    </p>
  </>
)

const faq = [
  {
    question: 'How accurate is the BMR calculator?',
    answer: 'The Mifflin-St Jeor Equation used in this calculator is considered one of the most accurate BMR formulas, with accuracy within ±5% for most individuals. However, individual variations in metabolism can affect results.',
  },
  {
    question: 'Do I need to calculate BMR before TDEE?',
    answer: 'Yes, BMR is the foundation for calculating TDEE. You multiply your BMR by an activity factor to get your total daily calorie needs. The TDEE calculator can calculate BMR internally, but knowing your BMR separately helps you understand your baseline metabolism.',
  },
  {
    question: 'How often should I recalculate my BMR?',
    answer: 'Recalculate your BMR whenever you experience significant weight changes (10+ lbs or 5+ kg), or every 3-6 months as your body composition changes. Muscle gain or loss, aging, and hormonal changes can all affect your BMR.',
  },
  {
    question: 'Why is my BMR different from online calculators?',
    answer: 'Different calculators may use different formulas (Harris-Benedict, Katch-McArdle, etc.). The Mifflin-St Jeor Equation used here is generally considered the most accurate for modern populations and is widely used in clinical settings.',
  },
]

const tips = [
  'Measure your weight in the morning before eating for the most accurate results',
  'Be honest about your measurements - accuracy is key for reliable calculations',
  'Remember that BMR is just your baseline - you burn more calories through daily activities',
  'Muscle mass increases BMR, so strength training can boost your metabolism over time',
]

const whenToRecalculate = 'Recalculate your BMR after significant weight changes (10+ lbs), major lifestyle changes, or every 3-6 months. Your BMR changes as your body composition, age, and activity level change.'

const accuracyNote = 'This calculator uses the Mifflin-St Jeor Equation, which is considered the most accurate BMR formula for modern populations. It\'s used in clinical settings and has been validated in numerous studies. Accuracy is typically within ±5% for most individuals.'

export default function BMRCalculatorPage() {
  return (
    <BMRCalculatorClient 
      content={content}
      faq={faq}
      tips={tips}
      whenToRecalculate={whenToRecalculate}
      accuracyNote={accuracyNote}
    />
  )
}
