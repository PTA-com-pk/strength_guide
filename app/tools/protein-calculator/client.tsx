'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculateProtein, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface ProteinCalculatorClientProps {
  content?: ReactNode
}

export default function ProteinCalculatorClient({ content }: ProteinCalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState('metric')
  const [formData, setFormData] = useState({
    weight: '',
    activityLevel: '',
    goal: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['weight', 'activityLevel', 'goal', 'unit'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        weight: prefill.weight?.toString() || '',
        activityLevel: prefill.activityLevel || '',
        goal: prefill.goal || '',
      })
      if (prefill.unit) setUnit(prefill.unit)
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const calculatedResult = calculateProtein(
        parseFloat(data.weight as string),
        data.activityLevel as string,
        data.goal as string,
        data.unit as string
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      storeCalculatorData({
        weight: parseFloat(data.weight as string),
        activityLevel: data.activityLevel as string,
        goal: data.goal as string,
        unit: data.unit as string,
        protein: calculatedResult.value,
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'protein-calculator',
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

  // Build link params for Macros calculator
  const buildLinkParams = (result: CalculatorResult) => {
    if (!formData.weight) return {}
    return {
      protein: Math.round(result.value).toString(),
      weight: formData.weight,
      goal: formData.goal,
      unit: unit,
    }
  }

  return (
    <CalculatorLayout
      title="Protein Calculator"
      description="Calculate how much protein you need daily based on your body weight, activity level, and fitness goals."
      calculatorType="protein-calculator"
      onSubmit={handleSubmit}
      result={result}
      error={error}
      content={content}
      buildLinkParams={buildLinkParams}
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Unit System</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input type="radio" name="unit" value="metric" checked={unit === 'metric'} onChange={(e) => setUnit(e.target.value)} className="mr-2" />
            Metric (kg)
          </label>
          <label className="flex items-center">
            <input type="radio" name="unit" value="imperial" checked={unit === 'imperial'} onChange={(e) => setUnit(e.target.value)} className="mr-2" />
            Imperial (lbs)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Body Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
        <input 
          type="number" 
          name="weight" 
          required 
          min="1" 
          step="0.1" 
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
        <select 
          name="activityLevel" 
          required 
          value={formData.activityLevel}
          onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select</option>
          <option value="sedentary">Sedentary</option>
          <option value="light">Light Activity</option>
          <option value="moderate">Moderate Activity</option>
          <option value="active">Active</option>
          <option value="very-active">Very Active</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Goal</label>
        <select 
          name="goal" 
          required 
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select</option>
          <option value="maintenance">Maintain Weight</option>
          <option value="muscle-gain">Build Muscle</option>
          <option value="fat-loss">Lose Fat</option>
        </select>
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate Protein Needs
      </button>
    </CalculatorLayout>
  )
}

