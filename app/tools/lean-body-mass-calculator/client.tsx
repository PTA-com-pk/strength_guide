'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculateLeanBodyMass, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface LeanBodyMassCalculatorClientProps {
  content?: ReactNode
}

export default function LeanBodyMassCalculatorClient({ content }: LeanBodyMassCalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState('metric')
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['weight', 'bodyFat', 'unit'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        weight: prefill.weight?.toString() || '',
        bodyFat: prefill.bodyFat?.toString() || '',
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
      const calculatedResult = calculateLeanBodyMass(
        parseFloat(data.weight as string),
        parseFloat(data.bodyFat as string),
        data.unit as string
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      storeCalculatorData({
        weight: parseFloat(data.weight as string),
        bodyFat: parseFloat(data.bodyFat as string),
        unit: data.unit as string,
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'lean-body-mass-calculator',
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
      title="Lean Body Mass Calculator"
      description="Calculate your lean body mass (LBM) - total weight minus body fat."
      calculatorType="lean-body-mass-calculator"
      onSubmit={handleSubmit}
      result={result}
      error={error}
      content={content}
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Body Fat Percentage (%)</label>
        <input 
          type="number" 
          name="bodyFat" 
          required 
          min="0" 
          max="100" 
          step="0.1" 
          value={formData.bodyFat}
          onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
        <p className="text-xs text-gray-500 mt-1">Use our Body Fat Calculator if you don't know this</p>
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate Lean Body Mass
      </button>
    </CalculatorLayout>
  )
}

