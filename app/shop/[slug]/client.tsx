'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProductClientProps {
  product: {
    _id: string
    name: string
    price: number
    images?: string[]
    inStock: boolean
    stockQuantity?: number
    productType?: 'regular' | 'affiliate'
    affiliateLink?: string
  }
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // Handle affiliate products (redirect to Amazon)
  const handleAffiliateClick = () => {
    if (product.affiliateLink) {
      // Track affiliate click (optional analytics)
      window.open(product.affiliateLink, '_blank', 'noopener,noreferrer')
    }
  }

  const handleAddToCart = async () => {
    // Affiliate products don't use cart - redirect to affiliate link
    if (product.productType === 'affiliate' && product.affiliateLink) {
      handleAffiliateClick()
      return
    }

    if (!product.inStock) {
      alert('This product is out of stock')
      return
    }

    setAdding(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          sku: product._id,
          image: product.images?.[0] || '',
        }),
      })

      if (response.ok) {
        setAdded(true)
        setTimeout(() => {
          setAdded(false)
        }, 3000)
      } else {
        alert('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const maxQuantity = product.stockQuantity || 10
  const isAffiliate = product.productType === 'affiliate'

  return (
    <div>
      {isAffiliate && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Affiliate Product:</strong> This product is sold on Amazon. Clicking "Buy on Amazon" will take you to Amazon.com where you can complete your purchase.
          </p>
        </div>
      )}

      {/* Quantity Selector - Only for regular products */}
      {!isAffiliate && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1
                setQuantity(Math.max(1, Math.min(maxQuantity, val)))
              }}
              className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold"
            />
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart / Buy on Amazon Button */}
      {isAffiliate ? (
        <button
          onClick={handleAffiliateClick}
          className="w-full py-4 rounded-lg font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.243 15.533.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.113 8.738 14.546z" fill="#FF9900"/>
            <path d="M18.59 7.41c-.78-.78-2.05-.78-2.83 0L12 10.17 8.24 6.41c-.78-.78-2.05-.78-2.83 0-.78.78-.78 2.05 0 2.83L9.17 13l-3.76 3.76c-.78.78-.78 2.05 0 2.83.39.39.9.59 1.41.59.51 0 1.02-.2 1.41-.59L12 15.83l3.76 3.76c.39.39.9.59 1.41.59.51 0 1.02-.2 1.41-.59.78-.78.78-2.05 0-2.83L14.83 13l3.76-3.76c.78-.78.78-2.05 0-2.83z" fill="#fff"/>
          </svg>
          Buy on Amazon
        </button>
      ) : product.inStock ? (
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {adding
            ? 'Adding...'
            : added
            ? '✓ Added to Cart!'
            : 'Add to Cart'}
        </button>
      ) : (
        <button
          disabled
          className="w-full py-4 rounded-lg font-bold text-lg bg-gray-400 text-white cursor-not-allowed"
        >
          Out of Stock
        </button>
      )}

      {/* Buy Now Button - Only for regular products */}
      {!isAffiliate && product.inStock && (
        <button
          onClick={() => router.push('/shop/cart')}
          className="w-full mt-3 py-4 rounded-lg font-bold text-lg bg-dark-900 text-white hover:bg-dark-800 transition-colors"
        >
          Buy Now
        </button>
      )}
    </div>
  )
}

