'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculate1RM, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface OneRepMaxCalculatorClientProps {
  content?: ReactNode
}

export default function OneRepMaxCalculatorClient({ content }: OneRepMaxCalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    weight: '',
    reps: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['weight', 'reps'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        weight: prefill.weight?.toString() || '',
        reps: prefill.reps?.toString() || '',
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
      const calculatedResult = calculate1RM(
        parseFloat(data.weight as string),
        parseInt(data.reps as string)
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      storeCalculatorData({
        weight: parseFloat(data.weight as string),
        reps: parseInt(data.reps as string),
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'one-rep-max-calculator',
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
      title="One Rep Max Calculator"
      description="Calculate your one-rep max (1RM) based on your current lifting performance."
      calculatorType="one-rep-max-calculator"
      onSubmit={handleSubmit}
      result={result}
      error={error}
      content={content}
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Weight Lifted (lbs)</label>
        <input 
          type="number" 
          name="weight" 
          required 
          min="1" 
          step="1" 
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Reps Completed</label>
        <input 
          type="number" 
          name="reps" 
          required 
          min="1" 
          max="30" 
          value={formData.reps}
          onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
        <p className="text-xs text-gray-500 mt-1">Enter the number of reps you completed with this weight</p>
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate 1RM
      </button>
    </CalculatorLayout>
  )
}

