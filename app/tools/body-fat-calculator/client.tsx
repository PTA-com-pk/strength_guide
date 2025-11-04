'use client'

import { useState, FormEvent, ReactNode, useEffect } from 'react'
import CalculatorLayout from '@/components/CalculatorLayout'
import { calculateBodyFat, CalculatorResult } from '@/lib/calculators'
import { storeCalculatorData, getPrefillData } from '@/lib/calculator-data'

interface BodyFatCalculatorClientProps {
  content?: ReactNode
}

export default function BodyFatCalculatorClient({ content }: BodyFatCalculatorClientProps) {
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnit] = useState('metric')
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    weight: '',
    height: '',
    neck: '',
    waist: '',
    hip: '',
  })

  // Prefill form from URL params or localStorage
  useEffect(() => {
    const prefill = getPrefillData(['gender', 'age', 'weight', 'height', 'unit'])
    if (Object.keys(prefill).length > 0) {
      setFormData({
        gender: prefill.gender || '',
        age: prefill.age?.toString() || '',
        weight: prefill.weight?.toString() || '',
        height: prefill.height?.toString() || '',
        neck: '',
        waist: '',
        hip: '',
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
      const calculatedResult = calculateBodyFat(
        data.gender as string,
        parseInt(data.age as string),
        parseFloat(data.weight as string),
        parseFloat(data.height as string),
        parseFloat(data.neck as string),
        parseFloat(data.waist as string),
        data.unit as string,
        data.hip ? parseFloat(data.hip as string) : undefined
      )

      setResult(calculatedResult)

      // Store data for prefilling other calculators
      const bodyFatPercent = calculatedResult.value
      storeCalculatorData({
        gender: data.gender as string,
        age: parseInt(data.age as string),
        weight: parseFloat(data.weight as string),
        height: parseFloat(data.height as string),
        unit: data.unit as string,
        bodyFat: bodyFatPercent,
      })

      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const user = userStr ? JSON.parse(userStr) : null

        await fetch('/api/calculators/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calculatorType: 'body-fat-calculator',
            inputs: data,
            results: calculatedResult,
            userId: user?._id || null,
          }),
        })
      } catch (saveError) {
        console.warn('Error saving calculator result:', saveError)
      }
    } catch (err: any) {
      setError(err.message || 'Please fill in all fields correctly')
      console.error('Calculation error:', err)
    }
  }

  // Build link params for Lean Body Mass calculator
  const buildLinkParams = (result: CalculatorResult) => {
    if (!formData.weight) return {}
    return {
      bodyFat: result.value.toFixed(1),
      weight: formData.weight,
      unit: unit,
    }
  }

  return (
    <CalculatorLayout
      title="Body Fat Calculator"
      description="Estimate your body fat percentage using various measurement methods."
      calculatorType="body-fat-calculator"
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
            Metric (cm, kg)
          </label>
          <label className="flex items-center">
            <input type="radio" name="unit" value="imperial" checked={unit === 'imperial'} onChange={(e) => setUnit(e.target.value)} className="mr-2" />
            Imperial (inches, lbs)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
        <select 
          name="gender" 
          required 
          value={formData.gender} 
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
        <input 
          type="number" 
          name="age" 
          required 
          min="1" 
          max="120" 
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Neck ({unit === 'metric' ? 'cm' : 'inches'})</label>
        <input 
          type="number" 
          name="neck" 
          required 
          min="1" 
          step="0.1" 
          value={formData.neck}
          onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
        <p className="text-xs text-gray-500 mt-1">Measure at the narrowest point</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Waist ({unit === 'metric' ? 'cm' : 'inches'})</label>
        <input 
          type="number" 
          name="waist" 
          required 
          min="1" 
          step="0.1" 
          value={formData.waist}
          onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
        />
        <p className="text-xs text-gray-500 mt-1">Measure at navel level</p>
      </div>

      {formData.gender === 'female' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Hip ({unit === 'metric' ? 'cm' : 'inches'})</label>
          <input 
            type="number" 
            name="hip" 
            required 
            min="1" 
            step="0.1" 
            value={formData.hip}
            onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
          />
          <p className="text-xs text-gray-500 mt-1">Measure at widest point</p>
        </div>
      )}

      <button type="submit" className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold">
        Calculate Body Fat
      </button>
    </CalculatorLayout>
  )
}

