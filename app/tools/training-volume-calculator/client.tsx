'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculateTrainingVolume, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface TrainingVolumeCalculatorClientProps {
  content?: ReactNode
}

export default function TrainingVolumeCalculatorClient({ content }: TrainingVolumeCalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState('imperial')
  const [formData, setFormData] = useState({
    sets: '',
    reps: '',
    weight: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['sets', 'reps', 'weight', 'unit'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        sets: prefill.sets?.toString() || '',
        reps: prefill.reps?.toString() || '',
        weight: prefill.weight?.toString() || '',
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
      const calculatedResult = calculateTrainingVolume(
        parseInt(data.sets as string),
        parseInt(data.reps as string),
        parseFloat(data.weight as string),
        data.unit as string
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      storeCalculatorData({
        sets: parseInt(data.sets as string),
        reps: parseInt(data.reps as string),
        weight: parseFloat(data.weight as string),
        unit: data.unit as string,
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'training-volume-calculator',
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
      title="Training Volume Calculator"
      description="Calculate your total training volume (sets × reps × weight) for any exercise."
      calculatorType="training-volume-calculator"
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Sets</label>
        <input 
          type="number" 
          name="sets" 
          required 
          min="1" 
          max="20" 
          value={formData.sets}
          onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Reps per Set</label>
        <input 
          type="number" 
          name="reps" 
          required 
          min="1" 
          max="100" 
          value={formData.reps}
          onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Weight per Rep ({unit === 'metric' ? 'kg' : 'lbs'})</label>
        <input 
          type="number" 
          name="weight" 
          required 
          min="1" 
          step="0.5" 
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate Volume
      </button>
    </CalculatorLayout>
  )
}

