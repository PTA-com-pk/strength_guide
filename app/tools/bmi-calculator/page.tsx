import { Metadata } from 'next'
import Link from 'next/link'
import BMICalculatorClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'BMI Calculator - Body Mass Index',
  description: 'Calculate your Body Mass Index (BMI) to assess your weight category. Free BMI calculator for adults.',
  keywords: ['BMI calculator', 'body mass index', 'BMI', 'weight calculator', 'health calculator'],
  openGraph: {
    title: 'BMI Calculator - StrengthGuide',
    description: 'Calculate your Body Mass Index (BMI) to assess your weight category.',
    url: `${baseUrl}/tools/bmi-calculator`,
  },
  alternates: {
    canonical: `${baseUrl}/tools/bmi-calculator`,
  },
}

const content = (
  <>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is BMI (Body Mass Index)?</h2>
    <p className="text-gray-700 mb-4">
      Body Mass Index (BMI) is a screening tool that uses your height and weight to estimate body fat. It's calculated by dividing your weight in kilograms by your height in meters squared. BMI provides a quick way to categorize weight status, though it doesn't directly measure body fat or account for muscle mass.
    </p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">BMI Categories</h3>
    <p className="text-gray-700 mb-4">
      BMI is categorized as follows:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Underweight:</strong> BMI below 18.5</li>
      <li><strong>Normal Weight:</strong> BMI between 18.5 and 24.9</li>
      <li><strong>Overweight:</strong> BMI between 25 and 29.9</li>
      <li><strong>Obese:</strong> BMI of 30 or higher</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Limitations of BMI</h3>
    <p className="text-gray-700 mb-4">
      While BMI is a useful screening tool, it has limitations:
    </p>
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
      <li><strong>Muscle Mass:</strong> Athletes with high muscle mass may have a high BMI but low body fat</li>
      <li><strong>Age:</strong> BMI doesn't account for age-related muscle loss</li>
      <li><strong>Body Composition:</strong> Two people with the same BMI can have very different body compositions</li>
      <li><strong>Location:</strong> BMI doesn't indicate where fat is stored on the body</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Why Use BMI?</h3>
    <p className="text-gray-700 mb-4">
      Despite its limitations, BMI is valuable because it's quick, easy to calculate, and provides a general indication of health risk. It's widely used by healthcare providers as a starting point for assessing weight-related health concerns.
    </p>

    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Next Steps</h3>
    <p className="text-gray-700 mb-4">
      For a more accurate assessment of your body composition, use our <Link href="/tools/body-fat-calculator" className="text-primary-600 hover:text-primary-700 underline">Body Fat Calculator</Link>. You can also check your <Link href="/tools/ideal-weight-calculator" className="text-primary-600 hover:text-primary-700 underline">Ideal Weight</Link> or calculate your <Link href="/tools/tdee-calculator" className="text-primary-600 hover:text-primary-700 underline">TDEE</Link> for weight management.
    </p>
  </>
)

export default function BMICalculatorPage() {
  return <BMICalculatorClient content={content} />
}
