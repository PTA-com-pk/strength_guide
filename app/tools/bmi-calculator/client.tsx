'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculateBMI, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface BMICalculatorClientProps {
  content?: ReactNode
}

export default function BMICalculatorClient({ content }: BMICalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState('metric')
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['weight', 'height', 'unit'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        weight: prefill.weight?.toString() || '',
        height: prefill.height?.toString() || '',
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
      const calculatedResult = calculateBMI(
        parseFloat(data.weight as string),
        parseFloat(data.height as string),
        data.unit as string
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      storeCalculatorData({
        weight: parseFloat(data.weight as string),
        height: parseFloat(data.height as string),
        unit: data.unit as string,
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'bmi-calculator',
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
      title="BMI Calculator"
      description="Calculate your Body Mass Index (BMI) to assess your weight category."
      calculatorType="bmi-calculator"
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
            Metric (kg, cm)
          </label>
          <label className="flex items-center">
            <input type="radio" name="unit" value="imperial" checked={unit === 'imperial'} onChange={(e) => setUnit(e.target.value)} className="mr-2" />
            Imperial (lbs, inches)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
        <input 
          type="number" 
          name="height" 
          required 
          min="1" 
          step="0.1" 
          value={formData.height}
          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate BMI
      </button>
    </CalculatorLayout>
  )
}

