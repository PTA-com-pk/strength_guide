'use client'

import Link from 'next/link'
import { useRef, useEffect } from 'react'

interface ToolsMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  menuItemRef: React.RefObject<HTMLElement | null>
}

const tools = [
  {
    name: 'BMR Calculator',
    slug: 'bmr-calculator',
    icon: '🔥',
    category: 'Nutrition',
  },
  {
    name: 'TDEE Calculator',
    slug: 'tdee-calculator',
    icon: '⚡',
    category: 'Nutrition',
  },
  {
    name: 'Protein Calculator',
    slug: 'protein-calculator',
    icon: '💪',
    category: 'Nutrition',
  },
  {
    name: 'Macros Calculator',
    slug: 'macros-calculator',
    icon: '🍽️',
    category: 'Nutrition',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    icon: '📏',
    category: 'Body Composition',
  },
  {
    name: 'Body Fat Calculator',
    slug: 'body-fat-calculator',
    icon: '📊',
    category: 'Body Composition',
  },
  {
    name: 'One Rep Max Calculator',
    slug: 'one-rep-max-calculator',
    icon: '🏋️',
    category: 'Strength',
  },
  {
    name: 'Training Volume Calculator',
    slug: 'training-volume-calculator',
    icon: '📈',
    category: 'Strength',
  },
  {
    name: 'Ideal Weight Calculator',
    slug: 'ideal-weight-calculator',
    icon: '⚖️',
    category: 'Body Composition',
  },
  {
    name: 'Calorie Deficit Calculator',
    slug: 'calorie-deficit-calculator',
    icon: '📉',
    category: 'Nutrition',
  },
  {
    name: 'Lean Body Mass Calculator',
    slug: 'lean-body-mass-calculator',
    icon: '🎯',
    category: 'Body Composition',
  },
]

export default function ToolsMegaMenu({ isOpen, onClose, menuItemRef }: ToolsMegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuItemRef.current &&
        !menuItemRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose, menuItemRef])

  if (!isOpen) return null

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof tools>)

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 bg-white shadow-xl border-t-2 border-primary-500 z-50 min-w-[500px]"
      style={{ marginTop: '0' }}
    >
      <div className="p-6">
        <Link
          href="/tools"
          className="block mb-4"
          onClick={onClose}
        >
          <h3 className="text-xl font-black text-gray-900 mb-2 hover:text-primary-600 transition-colors">
            Fitness Tools & Calculators
          </h3>
          <p className="text-sm text-gray-600">
            Free fitness calculators to help you track progress, plan nutrition, and optimize your training.
          </p>
        </Link>
        
        <div className="grid grid-cols-2 gap-6 mb-4">
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h4>
              <ul className="space-y-1.5">
                {categoryTools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-sm text-gray-700 hover:text-primary-600 hover:underline flex items-center py-1.5"
                      onClick={onClose}
                    >
                      <span className="mr-2 text-base">{tool.icon}</span>
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <Link
          href="/tools"
          className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          onClick={onClose}
        >
          View All Tools
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

