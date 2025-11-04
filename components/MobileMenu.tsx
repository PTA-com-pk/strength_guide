'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getUser, removeUser } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'

interface MobileMenuProps {
  categories: { name: string; slug: string }[]
  onClose: () => void
}

export default function MobileMenu({ categories, onClose }: MobileMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])
  
  // Check if a category is active based on current pathname
  const isCategoryActive = (categorySlug: string) => {
    if (pathname === `/category/${categorySlug}`) return true
    if (pathname.startsWith(`/${categorySlug}/`)) return true
    return false
  }
  
  // Check if Tools is active
  const isToolsActive = pathname === '/tools' || pathname.startsWith('/tools/')
  
  // Check if Shop is active
  const isShopActive = pathname === '/shop' || pathname.startsWith('/shop/')
  
  // Check if Account is active
  const isAccountActive = pathname === '/account' || pathname.startsWith('/account/')

  const handleLogout = () => {
    removeUser()
    setUser(null)
    router.push('/')
    router.refresh()
    onClose()
  }

  return (
    <div className="lg:hidden border-t border-dark-700 bg-dark-800">
      <nav className="container mx-auto px-4 py-4" aria-label="Mobile navigation">
        <div className="flex flex-col space-y-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={onClose}
              className={`px-4 py-4 text-sm font-semibold rounded-lg transition-all uppercase tracking-wide min-h-[48px] flex items-center ${
                isCategoryActive(category.slug)
                  ? 'text-primary-400 bg-dark-700 border-l-4 border-primary-400'
                  : 'text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600'
              }`}
              aria-label={`Navigate to ${category.name} category`}
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/tools"
            onClick={onClose}
            className={`px-4 py-4 text-sm font-semibold rounded-lg transition-all uppercase tracking-wide min-h-[48px] flex items-center ${
              isToolsActive
                ? 'text-primary-400 bg-dark-700 border-l-4 border-primary-400'
                : 'text-primary-400 hover:text-primary-300 hover:bg-dark-700 active:bg-dark-600'
            }`}
            aria-label="Navigate to Fitness Tools"
          >
            Tools
          </Link>
          <Link
            href="/shop"
            onClick={onClose}
            className={`px-4 py-4 text-sm font-semibold rounded-lg transition-all uppercase tracking-wide min-h-[48px] flex items-center ${
              isShopActive
                ? 'text-primary-400 bg-dark-700 border-l-4 border-primary-400'
                : 'text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600'
            }`}
            aria-label="Navigate to Shop"
          >
            Shop
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className={`px-4 py-4 text-sm font-semibold rounded-lg transition-colors mt-2 min-h-[48px] flex items-center ${
                  isAccountActive
                    ? 'text-white bg-primary-700 border-l-4 border-primary-400'
                    : 'text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                }`}
                aria-label="Navigate to Account"
              >
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-4 text-sm font-semibold text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600 rounded-lg transition-colors text-left min-h-[48px] flex items-center"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="px-4 py-4 text-sm font-semibold text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600 rounded-lg transition-colors mt-2 min-h-[48px] flex items-center"
                aria-label="Navigate to Login"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="px-4 py-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-lg transition-colors min-h-[48px] flex items-center justify-center"
                aria-label="Navigate to Sign Up"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
