'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AmazonProduct {
  asin: string
  title: string
  brand: string
  price: number
  currency: string
  availability: string
  isPrime: boolean
  images: {
    large: string
    medium: string
    small: string
  }
  rating: number
  reviewCount: number
  productUrl: string
}

export default function AmazonAdminPage() {
  const [keywords, setKeywords] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<AmazonProduct[]>([])
  const [importing, setImporting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setProducts([])

    try {
      const params = new URLSearchParams({
        keywords,
        ...(category && { category }),
      })

      const response = await fetch(`/api/amazon/search?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search products')
      }

      setProducts(data.items || [])
    } catch (err: any) {
      setError(err.message || 'Failed to search Amazon products')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (product: AmazonProduct, selectedCategory: string) => {
    setImporting(product.asin)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/amazon/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asin: product.asin,
          category: selectedCategory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import product')
      }

      setSuccess(`Product "${product.title}" imported successfully!`)
      setImporting(null)
    } catch (err: any) {
      setError(err.message || 'Failed to import product')
      setImporting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-black text-gray-900 mb-8">
          Amazon Associates Product Import
        </h1>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Setup Instructions
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Sign up for Amazon Associates at{' '}
              <a
                href="https://affiliate-program.amazon.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                affiliate-program.amazon.com
              </a>
            </li>
            <li>Apply for Product Advertising API access</li>
            <li>Get your Access Key, Secret Key, and Associate Tag</li>
            <li>Add them to your <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file:
              <pre className="bg-blue-100 p-3 rounded mt-2 text-sm overflow-x-auto">
                {`AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_associate_tag
AMAZON_REGION=us-east-1
AMAZON_HOST=webservices.amazon.com`}
              </pre>
            </li>
          </ol>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="keywords" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Keywords
              </label>
              <input
                type="text"
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., whey protein, dumbbells"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                <option value="supplements">Supplements</option>
                <option value="equipment">Equipment</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !keywords}
                className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Products'}
              </button>
            </div>
          </div>
        </form>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.asin}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
              >
                {product.images.medium && (
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={product.images.medium}
                      alt={product.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  {product.brand && (
                    <p className="text-sm text-gray-600 mb-2">Brand: {product.brand}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-black text-primary-600">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    {product.isPrime && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Prime
                      </span>
                    )}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <span>⭐ {product.rating.toFixed(1)}</span>
                      <span>({product.reviewCount} reviews)</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mb-4">{product.availability}</p>
                  
                  <div className="space-y-2">
                    <select
                      id={`category-${product.asin}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      defaultValue="supplements"
                    >
                      <option value="supplements">Supplements</option>
                      <option value="equipment">Equipment</option>
                      <option value="apparel">Apparel</option>
                      <option value="accessories">Accessories</option>
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById(`category-${product.asin}`) as HTMLSelectElement
                        handleImport(product, select.value)
                      }}
                      disabled={importing === product.asin}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {importing === product.asin ? 'Importing...' : 'Import Product'}
                    </button>
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm text-center"
                    >
                      View on Amazon
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && keywords && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  )
}

