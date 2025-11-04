'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculateCalorieDeficit, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface CalorieDeficitCalculatorClientProps {
  content?: ReactNode
}

export default function CalorieDeficitCalculatorClient({ content }: CalorieDeficitCalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tdee: '',
    goal: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['tdee', 'goal'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        tdee: prefill.tdee?.toString() || '',
        goal: prefill.goal || '',
      })
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const calculatedResult = calculateCalorieDeficit(
        parseFloat(data.tdee as string),
        data.goal as string
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      storeCalculatorData({
        tdee: parseFloat(data.tdee as string),
        goal: data.goal as string,
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'calorie-deficit-calculator',
            inputs: data,
            results: calculatedResult,
            userId: user?._id || null,
          }),
        })
      } catch (saveError) {
        console.warn('Error saving calculator result:', saveError)
      }
    } catch (err) {
      setError('Please fill in all fields correctly')
      console.error('Calculation error:', err)
    }
  }

  return (
    <CalculatorLayout
      title="Calorie Deficit Calculator"
      description="Calculate the optimal calorie deficit for safe and sustainable weight loss."
      calculatorType="calorie-deficit-calculator"
      onSubmit={handleSubmit}
      result={result}
      error={error}
      content={content}
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">TDEE (Total Daily Energy Expenditure)</label>
        <input 
          type="number" 
          name="tdee" 
          required 
          min="1000" 
          step="10" 
          value={formData.tdee}
          onChange={(e) => setFormData({ ...formData, tdee: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
        <p className="text-xs text-gray-500 mt-1">Use our TDEE calculator if you don't know this</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Weight Loss Goal</label>
        <select 
          name="goal" 
          required 
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select</option>
          <option value="moderate">Moderate (0.5 lbs/week)</option>
          <option value="aggressive">Aggressive (1 lb/week)</option>
          <option value="slow">Slow (0.25 lbs/week)</option>
        </select>
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate Deficit
      </button>
    </CalculatorLayout>
  )
}

