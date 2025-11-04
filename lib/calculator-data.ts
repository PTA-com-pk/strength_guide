/**
 * Utility functions for storing and retrieving calculator data
 * to enable prefilling forms when navigating between calculators
 */

export interface CalculatorData {
  // BMR/TDEE shared
  gender?: string
  age?: number
  weight?: number
  height?: number
  unit?: string
  
  // TDEE specific
  activityLevel?: string
  
  // BMR result
  bmr?: number
  
  // TDEE result
  tdee?: number
  
  // Protein specific
  protein?: number
  goal?: string
  
  // Body composition
  bodyFat?: number
  
  // Other
  [key: string]: any
}

const STORAGE_KEY = 'calculator_data'

/**
 * Store calculator data in localStorage
 */
export function storeCalculatorData(data: CalculatorData): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getCalculatorData()
    const merged = { ...existing, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (error) {
    console.warn('Failed to store calculator data:', error)
  }
}

/**
 * Get calculator data from localStorage
 */
export function getCalculatorData(): CalculatorData {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to get calculator data:', error)
    return {}
  }
}

/**
 * Clear calculator data from localStorage
 */
export function clearCalculatorData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear calculator data:', error)
  }
}

/**
 * Build URL with query parameters from calculator data
 */
export function buildCalculatorUrl(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.pathname + url.search
}

/**
 * Get URL parameters from current page
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * Prefill form data from URL params or localStorage
 */
export function getPrefillData(keys: string[]): Record<string, any> {
  const urlParams = getUrlParams()
  const storedData = getCalculatorData()
  const prefill: Record<string, any> = {}
  
  keys.forEach((key) => {
    // Prefer URL params over stored data
    if (urlParams[key] !== undefined) {
      const value = urlParams[key]
      // Try to parse as number if it looks like a number
      if (/^\d+\.?\d*$/.test(value)) {
        prefill[key] = parseFloat(value)
      } else {
        prefill[key] = value
      }
    } else if (storedData[key] !== undefined) {
      prefill[key] = storedData[key]
    }
  })
  
  return prefill
}

