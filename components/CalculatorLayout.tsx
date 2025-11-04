'use client'

import { useState, FormEvent, ReactNode, useMemo } from 'react'
import Link from 'next/link'
import { CalculatorResult } from '@/lib/calculators'
import { buildCalculatorUrl } from '@/lib/calculator-data'
import AdBanner from './AdBanner'

interface CalculatorLayoutProps {
  title: string
  description: string
  calculatorType: string
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>
  result: CalculatorResult | null
  error: string | null
  children: ReactNode
  content?: ReactNode
  buildLinkParams?: (result: CalculatorResult) => Record<string, any>
  faq?: Array<{ question: string; answer: string }>
  tips?: string[]
  whenToRecalculate?: string
  accuracyNote?: string
}

export default function CalculatorLayout({
  title,
  description,
  calculatorType,
  onSubmit,
  result,
  error,
  children,
  content,
  buildLinkParams,
  faq,
  tips,
  whenToRecalculate,
  accuracyNote,
}: CalculatorLayoutProps) {
  // Build URLs with prefilled data for tool links
  const toolLinksWithParams = useMemo(() => {
    const baseLinks: Record<string, string> = {
      'TDEE Calculator': '/tools/tdee-calculator',
      'Protein Calculator': '/tools/protein-calculator',
      'Macros Calculator': '/tools/macros-calculator',
      'Calorie Deficit Calculator': '/tools/calorie-deficit-calculator',
      'BMR Calculator': '/tools/bmr-calculator',
      'Body Fat Calculator': '/tools/body-fat-calculator',
      'BMI Calculator': '/tools/bmi-calculator',
      'Ideal Weight Calculator': '/tools/ideal-weight-calculator',
      'Lean Body Mass Calculator': '/tools/lean-body-mass-calculator',
      'Training Volume Calculator': '/tools/training-volume-calculator',
      'One Rep Max Calculator': '/tools/one-rep-max-calculator',
    }

    if (!result || !buildLinkParams) {
      return baseLinks
    }

    const params = buildLinkParams(result)
    const linksWithParams: Record<string, string> = {}
    
    Object.entries(baseLinks).forEach(([toolName, basePath]) => {
      // Only add params to relevant links
      if (params && Object.keys(params).length > 0) {
        linksWithParams[toolName] = buildCalculatorUrl(basePath, params)
      } else {
        linksWithParams[toolName] = basePath
      }
    })

    return linksWithParams
  }, [result, buildLinkParams])
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/tools" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
              ← Back to Tools
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-gray-600 text-lg">{description}</p>
          </div>

          {content && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-8 prose prose-lg max-w-none">
              {content}
            </div>
          )}

          {/* Accuracy Note */}
          {accuracyNote && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Scientific Accuracy</h3>
                  <p className="text-sm text-blue-800">{accuracyNote}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ad 1: Top Banner */}
          <div className="mb-8">
            <AdBanner size="leaderboard" label="Advertisement" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Calculator Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Calculator Form and Results */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Enter Your Information
                  </h2>
                  <form onSubmit={onSubmit} className="space-y-4">
                    {children}
                  </form>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Your Results
                  </h2>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}
                  {result ? (
                    <div>
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-500 rounded-lg p-6 mb-6 text-center">
                        <div className="text-4xl font-black text-primary-600 mb-2">
                          {result.value.toLocaleString()}
                        </div>
                        <div className="text-lg text-gray-700 font-semibold">
                          {result.unit}
                        </div>
                      </div>

                      {result.breakdown && (
                        <div className="mb-6">
                          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Breakdown
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {result.breakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                                <span className="text-gray-600">{item.label}:</span>
                                <span className="font-semibold text-gray-900">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recommendations & Tips
                          </h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <ul className="space-y-2">
                              {result.recommendations.map((rec, idx) => {
                                // Use toolLinksWithParams which includes query parameters

                                // Find all tool mentions and create parts array
                                const parts: Array<{ type: 'text' | 'link'; content: string; href?: string }> = []
                                let text = rec
                                let lastIndex = 0

                                // Find all tool mentions
                                const matches: Array<{ index: number; tool: string; path: string }> = []
                                Object.entries(toolLinksWithParams).forEach(([toolName, toolPath]) => {
                                  const regex = new RegExp(`\\b${toolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
                                  let match
                                  while ((match = regex.exec(text)) !== null) {
                                    matches.push({
                                      index: match.index,
                                      tool: match[0],
                                      path: toolPath,
                                    })
                                  }
                                })

                                // Sort matches by index
                                matches.sort((a, b) => a.index - b.index)

                                // Build parts array
                                matches.forEach((match) => {
                                  // Add text before match
                                  if (match.index > lastIndex) {
                                    const textPart = text.substring(lastIndex, match.index)
                                    if (textPart) {
                                      parts.push({ type: 'text', content: textPart })
                                    }
                                  }
                                  // Add link
                                  parts.push({ type: 'link', content: match.tool, href: match.path })
                                  lastIndex = match.index + match.tool.length
                                })

                                // Add remaining text
                                if (lastIndex < text.length) {
                                  parts.push({ type: 'text', content: text.substring(lastIndex) })
                                }

                                // If no links found, render plain text
                                if (parts.length === 0 || parts.every(p => p.type === 'text')) {
                                  return (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                                      <span className="text-primary-600 mr-2 font-bold">✓</span>
                                      <span>{rec}</span>
                                    </li>
                                  )
                                }

                                return (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                                    <span className="text-primary-600 mr-2 font-bold">✓</span>
                                    <span>
                                      {parts.map((part, partIdx) => {
                                        if (part.type === 'text') {
                                          return <span key={partIdx}>{part.content}</span>
                                        } else {
                                          return (
                                            <Link key={partIdx} href={part.href!} className="text-primary-600 hover:text-primary-700 font-semibold underline">
                                              {part.content}
                                            </Link>
                                          )
                                        }
                                      })}
                                    </span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p>Enter your information and click calculate to see results</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Section */}
              {tips && tips.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pro Tips
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-sm text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ad 2: Middle Rectangle */}
              <div className="flex justify-center my-8">
                <AdBanner size="rectangle" label="Advertisement" />
              </div>

              {/* When to Recalculate */}
              {whenToRecalculate && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    When to Recalculate
                  </h3>
                  <p className="text-sm text-amber-800">{whenToRecalculate}</p>
                </div>
              )}

              {/* FAQ Section */}
              {faq && faq.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {faq.map((item, idx) => (
                      <div key={idx} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <h3 className="font-bold text-gray-900 mb-2">{item.question}</h3>
                        <p className="text-sm text-gray-700">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Takes 1 column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Ad 3: Sidebar Rectangle */}
              <div>
                <AdBanner size="rectangle" label="Advertisement" />
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Facts
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">100% Free to use</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">No sign-up required</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Instant results</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Science-based formulas</span>
                  </div>
                </div>
              </div>

              {/* Related Calculators */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Related Tools
                </h3>
                <div className="space-y-2">
                  {Object.entries(toolLinksWithParams).slice(0, 5).map(([toolName, toolPath]) => (
                    toolName !== title && (
                      <Link
                        key={toolName}
                        href={toolPath}
                        className="block text-sm text-primary-600 hover:text-primary-700 hover:underline py-1"
                      >
                        → {toolName}
                      </Link>
                    )
                  ))}
                </div>
              </div>

              {/* Save Results CTA */}
              {result && (
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Your Results
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Your calculation has been automatically saved. View your history in your account.
                  </p>
                  <Link
                    href="/account"
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    View Calculator History →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Pre-Footer Section */}
          <div className="mt-16 space-y-8">
            {/* Popular Calculators Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Explore More Fitness Tools
              </h2>
              <p className="text-gray-600 mb-6">
                Discover our complete collection of free fitness calculators to help you achieve your health and fitness goals.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(toolLinksWithParams)
                  .filter(([toolName]) => toolName !== title)
                  .slice(0, 6)
                  .map(([toolName, toolPath]) => {
                    const iconMap: Record<string, string> = {
                      'BMR Calculator': '🔥',
                      'TDEE Calculator': '⚡',
                      'Protein Calculator': '💪',
                      'Macros Calculator': '🍽️',
                      'BMI Calculator': '📏',
                      'Body Fat Calculator': '📊',
                      'One Rep Max Calculator': '🏋️',
                      'Ideal Weight Calculator': '⚖️',
                      'Calorie Deficit Calculator': '📉',
                      'Lean Body Mass Calculator': '💪',
                      'Training Volume Calculator': '📈',
                    }
                    return (
                      <Link
                        key={toolName}
                        href={toolPath}
                        className="group bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg p-4 text-center transition-all duration-200"
                      >
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                          {iconMap[toolName] || '🔧'}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {toolName.replace(' Calculator', '')}
                        </h3>
                      </Link>
                    )
                  })}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/tools"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-bold text-lg"
                >
                  View All Calculators
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Newsletter Signup Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl md:text-3xl font-black mb-3">
                  Get Fitness Tips & Updates
                </h2>
                <p className="text-primary-100 mb-6 text-lg">
                  Subscribe to our newsletter and receive expert fitness advice, workout plans, nutrition tips, and exclusive calculator guides delivered straight to your inbox.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-primary-200 mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>

            {/* Trust Badges Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-black text-primary-600 mb-2">100%</div>
                  <div className="text-sm text-gray-600">Free to Use</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary-600 mb-2">1000+</div>
                  <div className="text-sm text-gray-600">Daily Calculations</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary-600 mb-2">Science</div>
                  <div className="text-sm text-gray-600">Based Formulas</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary-600 mb-2">No Sign</div>
                  <div className="text-sm text-gray-600">Up Required</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

