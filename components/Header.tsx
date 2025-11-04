'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import MegaMenu from './MegaMenu'
import ToolsMegaMenu from './ToolsMegaMenu'
import CartIcon from './CartIcon'
import { getUser, removeUser } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { getMegaMenuData } from '@/lib/mega-menu-cache'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [activeToolsMenu, setActiveToolsMenu] = useState(false)
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const megaMenuRefs = useRef<Record<string, React.RefObject<HTMLAnchorElement>>>({})
  const toolsMenuRef = useRef<HTMLAnchorElement>(null)
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Check if a category is active based on current pathname
  const isCategoryActive = (categorySlug: string) => {
    // Check if we're on the category page
    if (pathname === `/category/${categorySlug}`) return true
    // Check if we're on an article page in this category
    if (pathname.startsWith(`/${categorySlug}/`)) return true
    return false
  }
  
  // Check if Tools is active
  const isToolsActive = pathname === '/tools' || pathname.startsWith('/tools/')
  
  // Check if Shop is active
  const isShopActive = pathname === '/shop' || pathname.startsWith('/shop/')
  
  // Check if other pages are active
  const isAboutActive = pathname === '/about'
  const isContactActive = pathname === '/contact'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Check for user
    setUser(getUser())
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      setUser(getUser())
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    removeUser()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  // Top-level categories to show in main menu
  const topLevelCategories = [
    'muscle-building',
    'fat-loss',
    'nutrition',
    'training',
    'women',
    'supplements',
  ]

  const [allCategories, setAllCategories] = useState<Array<{ name: string; slug: string; description?: string }>>([])
  const [activeMoreMenu, setActiveMoreMenu] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Fetch all categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories - use default cache to allow bfcache
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          // Map the fetched categories to the format we need
          const fetchedCategories = data.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
          }))
          setAllCategories(fetchedCategories)
          
          // Initialize refs for all categories
          fetchedCategories.forEach((category: { slug: string }) => {
            if (!megaMenuRefs.current[category.slug]) {
              megaMenuRefs.current[category.slug] = { current: null } as React.RefObject<HTMLAnchorElement>
            }
          })
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  // Separate categories into top-level and "More" categories
  const categories = allCategories.filter(cat => topLevelCategories.includes(cat.slug))
  const moreCategories = allCategories.filter(cat => !topLevelCategories.includes(cat.slug))

  // Group "More" categories logically
  const groupedMoreCategories = {
    'Training & Performance': moreCategories.filter(cat => 
      ['workouts', 'recovery', 'sport', 'injury'].includes(cat.slug)
    ),
    'Lifestyle & Community': moreCategories.filter(cat => 
      ['motivation', 'lifestyle', 'interviews'].includes(cat.slug)
    ),
  }

  // Initialize refs for each category
  useEffect(() => {
    categories.forEach((category) => {
      if (!megaMenuRefs.current[category.slug]) {
        megaMenuRefs.current[category.slug] = { current: null } as React.RefObject<HTMLAnchorElement>
      }
    })
  }, [categories])

  const handleMoreMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
    }
    setActiveToolsMenu(false)
    setActiveMegaMenu(null)
    setActiveMoreMenu(true)
  }

  const handleMoreMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMoreMenu(false)
    }, 200)
  }

  const handleMouseEnter = (slug: string) => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
    }
    
    // Close Tools menu and More menu when hovering over a category
    setActiveToolsMenu(false)
    setActiveMoreMenu(false)
    
    // Prefetch mega menu data immediately on hover (before menu opens)
    // This makes the menu feel instant when it opens
    // Uses shared cache so subsequent menus are instant
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
    }
    
    // Start prefetching immediately on hover
    prefetchTimeoutRef.current = setTimeout(() => {
      getMegaMenuData().catch(() => {
        // Silently fail - menu will fetch when it opens
      })
    }, 0) as any
    
    setActiveMegaMenu(slug)
  }

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 200) // Small delay to allow moving to mega menu
  }

  const handleMegaMenuMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
    }
  }

  const handleMegaMenuMouseLeave = () => {
    setActiveMegaMenu(null)
  }

  const handleToolsMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
    }
    // Close any open category menu and More menu when hovering over Tools
    setActiveMegaMenu(null)
    setActiveMoreMenu(false)
    setActiveToolsMenu(true)
  }

  const handleToolsMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveToolsMenu(false)
    }, 200)
  }

  const handleToolsMegaMenuMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
    }
  }

  const handleToolsMegaMenuMouseLeave = () => {
    setActiveToolsMenu(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-900 shadow-lg'
          : 'bg-dark-900'
      }`}
    >
      {/* Top Bar */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <Link 
                href="#newsletter" 
                className="hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  // Scroll to newsletter section if on homepage, otherwise navigate
                  if (pathname === '/') {
                    const newsletter = document.getElementById('newsletter')
                    if (newsletter) {
                      newsletter.scrollIntoView({ behavior: 'smooth' })
                    }
                  } else {
                    router.push('/#newsletter')
                  }
                }}
              >
                📧 Free Newsletter
              </Link>
              <span>•</span>
              <Link 
                href="/category/workouts" 
                className="hover:text-white transition-colors cursor-pointer"
              >
                1000+ Workouts
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/about" 
                className={`transition-colors ${
                  isAboutActive ? 'text-white font-semibold' : 'hover:text-white'
                }`}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`transition-colors ${
                  isContactActive ? 'text-white font-semibold' : 'hover:text-white'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-stretch gap-6">
          {/* Logo - Full Height */}
          <Link href="/" className="flex items-center justify-center flex-shrink-0 min-w-[160px] self-stretch">
            <Image
              src="/logo.png"
              alt="StrengthGuide Logo"
              width={150}
              height={90}
              className="h-full w-auto max-h-[120px] object-contain"
              sizes="(max-width: 768px) 150px, 200px"
              priority
            />
          </Link>

          {/* Right Side Content - Split into two rows */}
          <div className="flex-1 flex flex-col">
            {/* Top Row: Search Bar and Right Side Actions */}
            <div className="flex items-center justify-end h-20 gap-4">
              {/* Search Bar - Close to Right Side */}
              <div className="hidden md:flex items-center flex-1 justify-end pr-4">
                <div className="w-full max-w-xl min-w-[300px]">
                  <SearchBar />
                </div>
              </div>

              {/* Right Side: Shop, Cart, and Account */}
              <div className="flex items-center space-x-3 md:space-x-4 flex-shrink-0">
                <Link
                  href="/shop"
                  className={`hidden lg:block text-sm font-medium transition-colors whitespace-nowrap ${
                    isShopActive
                      ? 'text-primary-400 font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Shop
                </Link>
                <div className="hidden lg:block w-px h-6 bg-dark-700"></div>
                <CartIcon />
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/articles"
                        target="_blank"
                        className="hidden md:block px-3 py-1.5 text-sm font-semibold text-yellow-400 hover:text-yellow-300 border border-yellow-400 rounded transition-colors whitespace-nowrap"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="hidden md:block px-3 py-1.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors whitespace-nowrap"
                    >
                      {user.name || 'Account'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hidden md:block px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="hidden md:block px-3 py-1.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="hidden md:block px-3 py-1.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMobileMenuOpen}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="hidden lg:block border-t border-dark-700 my-2"></div>

            {/* Bottom Row: Desktop Navigation - Parallel to Search Bar */}
            <div className="hidden lg:flex items-center justify-center pt-3 pb-3">
              <div className="flex-1 flex justify-center items-center">
                <nav className="flex items-center space-x-6">
            {categories.map((category) => {
              if (!megaMenuRefs.current[category.slug]) {
                megaMenuRefs.current[category.slug] = { current: null } as React.RefObject<HTMLAnchorElement>
              }
              const ref = megaMenuRefs.current[category.slug]
              return (
                <div
                  key={category.slug}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(category.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    ref={ref}
                    href={`/category/${category.slug}`}
                    className={`text-sm font-medium transition-colors flex items-center ${
                      isCategoryActive(category.slug)
                        ? 'text-primary-400 font-semibold border-b-2 border-primary-400 pb-1'
                        : activeMegaMenu === category.slug
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {category.name}
                    <svg
                      className={`ml-1.5 w-3.5 h-3.5 transition-transform ${
                        activeMegaMenu === category.slug ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {activeMegaMenu === category.slug && (
                    <div
                      className="absolute left-0 top-full pt-2"
                      onMouseEnter={handleMegaMenuMouseEnter}
                      onMouseLeave={handleMegaMenuMouseLeave}
                    >
                      <MegaMenu
                        category={category}
                        isOpen={true}
                        onClose={() => setActiveMegaMenu(null)}
                        menuItemRef={ref}
                      />
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* More Menu - Groups remaining categories */}
            {moreCategories.length > 0 && (
              <div
                ref={moreMenuRef}
                className="relative"
                onMouseEnter={handleMoreMouseEnter}
                onMouseLeave={handleMoreMouseLeave}
              >
                <div
                  className={`text-sm font-medium transition-colors flex items-center cursor-pointer ${
                    activeMoreMenu
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  More
                  <svg
                    className={`ml-1.5 w-3.5 h-3.5 transition-transform ${
                      activeMoreMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {activeMoreMenu && (
                  <div
                    className="absolute left-0 top-full pt-2 z-50"
                    onMouseEnter={handleMoreMouseEnter}
                    onMouseLeave={handleMoreMouseLeave}
                  >
                    <div className="bg-white shadow-xl border-t-2 border-primary-500 min-w-[500px] rounded-b-lg overflow-hidden">
                      <div className="p-6">
                        {Object.entries(groupedMoreCategories).map(([groupName, groupCats]) => (
                          groupCats.length > 0 && (
                            <div key={groupName} className="mb-6 last:mb-0">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                {groupName}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {groupCats.map((cat) => (
                                  <Link
                                    key={cat.slug}
                                    href={`/category/${cat.slug}`}
                                    className="text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                                    onClick={() => setActiveMoreMenu(false)}
                                  >
                                    {cat.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div
              className="relative"
              onMouseEnter={handleToolsMouseEnter}
              onMouseLeave={handleToolsMouseLeave}
            >
              <Link
                ref={toolsMenuRef}
                href="/tools"
                className={`text-sm font-medium transition-colors flex items-center ${
                  isToolsActive
                    ? 'text-primary-400 font-semibold border-b-2 border-primary-400 pb-1'
                    : activeToolsMenu
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Tools
                <svg
                  className={`ml-1.5 w-3.5 h-3.5 transition-transform ${
                    activeToolsMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {activeToolsMenu && (
                <div
                  className="absolute left-0 top-full pt-2"
                  onMouseEnter={handleToolsMegaMenuMouseEnter}
                  onMouseLeave={handleToolsMegaMenuMouseLeave}
                >
                  <ToolsMegaMenu
                    isOpen={true}
                    onClose={() => setActiveToolsMenu(false)}
                    menuItemRef={toolsMenuRef}
                  />
                </div>
              )}
            </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        categories={allCategories}
        onClose={() => setIsMobileMenuOpen(false)}
        isOpen={isMobileMenuOpen}
      />
    </header>
  )
}
