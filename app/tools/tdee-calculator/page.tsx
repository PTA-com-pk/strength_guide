import { Metadata } from 'next'
import Link from 'next/link'
import TDEECalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'TDEE Calculator - Total Daily Energy Expenditure',
  description: 'Calculate your Total Daily Energy Expenditure (TDEE) - total calories burned per day including activity. Free TDEE calculator for accurate calorie needs.',
  keywords: ['TDEE calculator', 'total daily energy expenditure', 'calorie calculator', 'metabolism calculator'],
  openGraph: {
    title: 'TDEE Calculator - StrengthGuide',
    description: 'Calculate your Total Daily Energy Expenditure (TDEE) - total calories burned per day including activity.',
    url: `${baseUrl}/tools/tdee-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/tdee-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is TDEE (Total Daily Energy Expenditure)?</h2>
    <p className="text-gray-700 mb-4">
      Your Total Daily Energy Expenditure (TDEE) is the total number of calories you burn per day, including all activities from basic bodily functions to exercise. It's your BMR multiplied by an activity factor based on your lifestyle.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">How is TDEE Calculated?</h3>
    <p className="text-gray-700 mb-4">
      TDEE is calculated by multiplying your Basal Metabolic Rate (BMR) by an activity multiplier:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Sedentary (1.2):</strong> Little to no exercise, desk job</li>
      <li><strong>Light Activity (1.375):</strong> Light exercise 1-3 days per week</li>
      <li><strong>Moderate Activity (1.55):</strong> Moderate exercise 3-5 days per week</li>
      <li><strong>Active (1.725):</strong> Hard exercise 6-7 days per week</li>
      <li><strong>Extra Active (1.9):</strong> Very hard exercise, physical job, or training twice per day</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why is TDEE Important?</h3>
    <p className="text-gray-700 mb-4">
      Your TDEE is the foundation for:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Weight Maintenance:</strong> Eat your TDEE to maintain your current weight</li>
      <li><strong>Weight Loss:</strong> Eat 500-1000 calories below TDEE to lose 1-2 lbs per week</li>
      <li><strong>Muscle Gain:</strong> Eat 300-500 calories above TDEE while strength training</li>
      <li><strong>Nutrition Planning:</strong> Essential for creating meal plans and tracking macros</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      Once you know your TDEE, use our <Link href="/tools/calorie-deficit-calculator" className="text-primary-600 hover:text-primary-700 underline">Calorie Deficit Calculator</Link> to plan weight loss, or our <Link href="/tools/macros-calculator" className="text-primary-600 hover:text-primary-700 underline">Macros Calculator</Link> to balance your protein, carbs, and fats.
    </p>
  </>
)

const faq = [
  {
    question: 'What\'s the difference between BMR and TDEE?',
    answer: 'BMR (Basal Metabolic Rate) is the calories you burn at complete rest. TDEE (Total Daily Energy Expenditure) includes BMR plus all activities throughout the day - exercise, walking, fidgeting, etc. TDEE = BMR × Activity Factor.',
  },
  {
    question: 'How do I know which activity level to choose?',
    answer: 'Be honest about your weekly exercise routine. Sedentary means little to no exercise. Light activity is 1-3 days/week. Moderate is 3-5 days/week. Active is 6-7 days/week. Extra active includes very hard exercise or a physical job.',
  },
  {
    question: 'Can I lose weight by eating my TDEE?',
    answer: 'No, eating at your TDEE will maintain your current weight. To lose weight, you need to eat 500-1000 calories below your TDEE (for 1-2 lbs per week loss). Use our Calorie Deficit Calculator to plan your weight loss.',
  },
  {
    question: 'How accurate is TDEE?',
    answer: 'TDEE estimates are generally accurate within ±10-15% when activity level is correctly assessed. For more precision, track your food intake and weight changes over 2-3 weeks and adjust your TDEE based on actual results.',
  },
]

const tips = [
  'Be honest about your activity level - overestimating leads to overeating',
  'If you\'re between activity levels, choose the lower one for weight loss',
  'TDEE decreases as you lose weight - recalculate every 10-15 lbs',
  'Non-exercise activity (walking, fidgeting) can significantly impact TDEE',
]

const whenToRecalculate = 'Recalculate your TDEE after weight changes of 10+ lbs, significant changes in activity level, or every 4-6 weeks during a weight loss or gain phase. Your TDEE changes as your weight and activity level change.'

const accuracyNote = 'TDEE is calculated using the Mifflin-St Jeor Equation for BMR, multiplied by scientifically validated activity multipliers. Accuracy depends on correctly assessing your activity level and is typically within ±10-15% for most individuals.'

export default function TDEECalculatorPage() {
  return (
    <TDEECalculatorClient 
      content={content}
      faq={faq}
      tips={tips}
      whenToRecalculate={whenToRecalculate}
      accuracyNote={accuracyNote}
    />
  )
}
