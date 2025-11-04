import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  className = '',
}: PaginationProps) {
  const generatePageUrl = (page: number) => {
    const params = new URLSearchParams()
    
    // Add page number
    if (page > 1) {
      params.set('page', page.toString())
    }
    
    // Add other search params (sort, order, etc.)
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.set(key, value)
      }
    })
    
    const queryString = params.toString()
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push('ellipsis-start')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push('ellipsis-start')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      aria-label="Pagination"
    >
      {/* First Page Button */}
      {currentPage > 1 && (
        <Link
          href={generatePageUrl(1)}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600 transition-all font-semibold text-sm"
          aria-label="Go to first page"
        >
          « First
        </Link>
      )}

      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={generatePageUrl(currentPage - 1)}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600 transition-all font-semibold text-sm"
          aria-label="Go to previous page"
        >
          ← Previous
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-gray-500"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={generatePageUrl(pageNum)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all min-w-[44px] text-center ${
                isActive
                  ? 'bg-primary-600 text-white border-2 border-primary-600 shadow-md'
                  : 'bg-white border-2 border-gray-300 hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600'
              }`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={generatePageUrl(currentPage + 1)}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600 transition-all font-semibold text-sm"
          aria-label="Go to next page"
        >
          Next →
        </Link>
      )}

      {/* Last Page Button */}
      {currentPage < totalPages && (
        <Link
          href={generatePageUrl(totalPages)}
          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 hover:text-primary-600 transition-all font-semibold text-sm"
          aria-label="Go to last page"
        >
          Last »
        </Link>
      )}

      {/* Page Info */}
      <div className="w-full md:w-auto text-center md:text-left text-sm text-gray-600 mt-2 md:mt-0 md:ml-4">
        Page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>
    </nav>
  )
}

