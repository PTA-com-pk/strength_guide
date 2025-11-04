'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getUser, removeUser } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'

interface MobileMenuProps {
  categories: { name: string; slug: string }[]
  onClose: () => void
  isOpen?: boolean
}

// Icon components for better visual recognition
const CategoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const ToolsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ShopIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

const AccountIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function MobileMenu({ categories, onClose, isOpen = false }: MobileMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getUser())
  }, [])

  // Most popular/common categories to show directly
  const popularCategorySlugs = [
    'muscle-building',
    'fat-loss',
    'nutrition',
    'training',
    'for-women',
    'women', // Handle both variations
    'supplements',
  ]

  // Separate categories into popular and less common
  const popularCats = categories.filter(cat => 
    popularCategorySlugs.includes(cat.slug)
  )
  const moreCats = categories.filter(cat => 
    !popularCategorySlugs.includes(cat.slug)
  )

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }
  
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
    handleClose()
  }

  // Disable page scroll when menu is open, enable menu scroll
  const scrollPositionRef = useRef(0)
  const originalBodyStyles = useRef<{
    overflow: string
    position: string
    top: string
    left: string
    right: string
    width: string
    paddingRight: string
  }>({
    overflow: '',
    position: '',
    top: '',
    left: '',
    right: '',
    width: '',
    paddingRight: '',
  })

  useEffect(() => {
    if (!mounted) return

    if (isOpen && !isClosing) {
      // Save current scroll position
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      
      // Save original body styles
      originalBodyStyles.current = {
        overflow: document.body.style.overflow || '',
        position: document.body.style.position || '',
        top: document.body.style.top || '',
        left: document.body.style.left || '',
        right: document.body.style.right || '',
        width: document.body.style.width || '',
        paddingRight: document.body.style.paddingRight || '',
      }
      
      // Calculate scrollbar width to prevent layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Disable page scroll - use CSS class for reliable scroll lock
      document.body.classList.add('menu-open')
      document.documentElement.classList.add('menu-open')
      
      // Set inline styles for position and top
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.paddingRight = `${scrollBarWidth}px`
      
      // Store scroll position in data attribute for restoration
      document.body.setAttribute('data-scroll-top', scrollPositionRef.current.toString())
      
    } else {
      // Enable page scroll - remove CSS classes
      document.body.classList.remove('menu-open')
      document.documentElement.classList.remove('menu-open')
      
      // Clear inline styles
      document.body.style.top = ''
      document.body.style.paddingRight = ''
      
      // Restore scroll position
      const savedScrollTop = document.body.getAttribute('data-scroll-top')
      if (savedScrollTop) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollTop, 10))
          document.body.removeAttribute('data-scroll-top')
        })
      } else if (scrollPositionRef.current > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositionRef.current)
        })
      }
    }

    return () => {
      // Cleanup: restore page scroll
      document.body.classList.remove('menu-open')
      document.documentElement.classList.remove('menu-open')
      document.body.style.top = ''
      document.body.style.paddingRight = ''
      
      const savedScrollTop = document.body.getAttribute('data-scroll-top')
      if (savedScrollTop) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollTop, 10))
          document.body.removeAttribute('data-scroll-top')
        })
      } else if (scrollPositionRef.current > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositionRef.current)
        })
      }
    }
  }, [isOpen, isClosing, mounted])

  // Don't render if menu is not open or not mounted
  if (!mounted || (!isOpen && !isClosing)) {
    return null
  }

  const menuContent = (
    <>
      {/* Backdrop - Prevents page interaction */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
        style={{ 
          touchAction: 'none',
          overscrollBehavior: 'none'
        }}
      />

      {/* Mobile Menu - Enable scroll within menu */}
      <div
        data-menu-content
        className={`fixed top-0 right-0 h-screen w-full max-w-sm bg-dark-800 shadow-2xl z-[9999] lg:hidden transform transition-transform duration-200 ease-out ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ 
          overscrollBehavior: 'contain'
        }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-dark-700 bg-dark-900">
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable menu, fixed footer */}
        <nav className="flex flex-col h-[calc(100vh-73px)]" aria-label="Mobile navigation">
          <div 
            data-scrollable
            className="flex-1 overflow-y-auto px-2 py-2"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y'
            }}
          >
            {/* Popular Categories - Always visible */}
            <div className="mb-1">
              <div className="space-y-0">
                {popularCats.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    onClick={handleClose}
                    className={`group px-2.5 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] flex items-center gap-2 ${
                      isCategoryActive(category.slug)
                        ? 'text-primary-400 bg-primary-900/30 border-l-2 border-primary-400'
                        : 'text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600'
                    }`}
                    aria-label={`Navigate to ${category.name} category`}
                  >
                    <CategoryIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isCategoryActive(category.slug) ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                    <span className="flex-1 truncate text-sm">{category.name}</span>
                    {isCategoryActive(category.slug) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* More Categories - Collapsible */}
            {moreCats.length > 0 && (
              <div className="mb-1">
                <button
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  className="w-full px-2.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600 rounded-md transition-all min-h-[40px] flex items-center justify-between"
                  aria-expanded={showMoreCategories}
                  aria-label={showMoreCategories ? 'Collapse more categories' : 'Expand more categories'}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-sm">More Categories</span>
                    <span className="text-xs text-gray-500">({moreCats.length})</span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showMoreCategories ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMoreCategories && (
                  <div className="mt-0.5 ml-3 space-y-0 border-l-2 border-dark-700 pl-2.5">
                    {moreCats.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        onClick={handleClose}
                        className={`group px-2.5 py-1.5 text-sm font-medium rounded-md transition-all min-h-[36px] flex items-center gap-2 ${
                          isCategoryActive(category.slug)
                            ? 'text-primary-400 bg-primary-900/30'
                            : 'text-gray-400 hover:text-white hover:bg-dark-700 active:bg-dark-600'
                        }`}
                        aria-label={`Navigate to ${category.name} category`}
                      >
                        <span className="flex-1 truncate text-sm">{category.name}</span>
                        {isCategoryActive(category.slug) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-dark-700" />

            {/* Tools & Shop */}
            <div className="space-y-0">
              <Link
                href="/tools"
                onClick={handleClose}
                className={`group px-2.5 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] flex items-center gap-2 ${
                  isToolsActive
                    ? 'text-primary-400 bg-primary-900/30 border-l-3 border-primary-400'
                    : 'text-primary-400 hover:text-primary-300 hover:bg-dark-700 active:bg-dark-600'
                }`}
                aria-label="Navigate to Fitness Tools"
              >
                <ToolsIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isToolsActive ? 'text-primary-400' : 'text-primary-500 group-hover:text-primary-400'}`} />
                <span className="flex-1 text-sm">Fitness Tools</span>
                {isToolsActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />}
              </Link>
              <Link
                href="/shop"
                onClick={handleClose}
                className={`group px-2.5 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] flex items-center gap-2 ${
                  isShopActive
                    ? 'text-primary-400 bg-primary-900/30 border-l-3 border-primary-400'
                    : 'text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600'
                }`}
                aria-label="Navigate to Shop"
              >
                <ShopIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isShopActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                <span className="flex-1 text-sm">Shop</span>
                {isShopActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />}
              </Link>
            </div>

          </div>

          {/* User section - Fixed at bottom, always visible */}
          <div className="border-t border-dark-700 bg-dark-900 px-2 py-2 flex-shrink-0">
            {user ? (
              <div className="space-y-0.5">
                <Link
                  href="/account"
                  onClick={handleClose}
                  className={`group px-2.5 py-2 text-sm font-medium rounded-md transition-all min-h-[40px] flex items-center gap-2 ${
                    isAccountActive
                      ? 'text-white bg-primary-700 border-l-3 border-primary-400'
                      : 'text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                  }`}
                  aria-label="Navigate to Account"
                >
                  <AccountIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 text-sm">My Account</span>
                  {isAccountActive && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-2.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600 rounded-md transition-colors text-left min-h-[40px] flex items-center gap-2"
                  aria-label="Logout"
                >
                  <LogoutIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  onClick={handleClose}
                  className="px-2.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-700 active:bg-dark-600 rounded-md transition-colors min-h-[40px] flex items-center justify-center"
                  aria-label="Navigate to Login"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={handleClose}
                  className="px-2.5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-md transition-colors min-h-[40px] flex items-center justify-center"
                  aria-label="Navigate to Sign Up"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  )

  // Render using portal at document body level for better isolation
  return mounted && typeof window !== 'undefined'
    ? createPortal(menuContent, document.body)
    : null
}
