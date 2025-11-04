'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { getMegaMenuData } from '@/lib/mega-menu-cache'

interface MegaMenuProps {
  category: { name: string; slug: string; description?: string }
  isOpen: boolean
  onClose: () => void
  menuItemRef: React.RefObject<HTMLElement | null>
}

interface MenuData {
  description: string
  links: Array<{ name: string; href: string }>
}

export default function MegaMenu({ category, isOpen, onClose, menuItemRef }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  // Fetch menu data when menu opens (with shared cache)
  useEffect(() => {
    if (isOpen) {
      // Always show loading state when opening
      if (!menuData) {
        setIsLoading(true)
      }
      
      // Use shared cache - if another menu already fetched, we get instant data
      getMegaMenuData()
        .then((data) => {
          if (data && data[category.slug]) {
            setMenuData(data[category.slug])
          } else {
            // Fallback if no data found
            setMenuData({
              description: category.description || `Explore ${category.name} articles, guides, and expert advice.`,
              links: [],
            })
          }
        })
        .catch((error) => {
          console.error('Error fetching mega menu data:', error)
          // Fallback on error
          setMenuData({
            description: category.description || `Explore ${category.name} articles, guides, and expert advice.`,
            links: [],
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen, category.slug, category.description, category.name, menuData])

  // Reset menu data when category changes
  useEffect(() => {
    setMenuData(null)
  }, [category.slug])

  const data = menuData || {
    description: category.description || `Explore ${category.name} articles, guides, and expert advice.`,
    links: [],
  }

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 bg-white shadow-xl border-t-2 border-primary-500 z-50 min-w-[400px]"
      style={{ marginTop: '0' }}
    >
      <div className="p-6">
        <Link
          href={`/category/${category.slug}`}
          className="block mb-4"
          onClick={onClose}
        >
          <h3 className="text-xl font-black text-gray-900 mb-2 hover:text-primary-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600">
            {data.description}
          </p>
        </Link>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-gray-500 text-sm">Loading articles...</p>
          </div>
        ) : data.links.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {data.links.map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-700 hover:text-primary-600 hover:underline flex items-center py-1"
                  onClick={onClose}
                >
                  <svg className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-4 text-center text-gray-500 text-sm">
            No articles available yet.
          </div>
        )}
        
        <Link
          href={`/category/${category.slug}`}
          className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          onClick={onClose}
        >
          View All {category.name}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

