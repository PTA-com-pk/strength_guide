'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Cart {
  items: any[]
  total: number
}

export default function CartIcon() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
    
    // Refresh cart every 5 seconds
    const interval = setInterval(fetchCart, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Link
      href="/shop/cart"
      className="relative flex items-center justify-center p-2 text-gray-300 hover:text-white transition-colors rounded hover:bg-dark-800"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {!loading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}

