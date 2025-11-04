'use client'

interface AdBannerProps {
  size?: 'leaderboard' | 'rectangle' | 'square' | 'skyscraper' | 'mobile'
  className?: string
  label?: string
}

export default function AdBanner({ 
  size = 'leaderboard', 
  className = '',
  label = 'Advertisement'
}: AdBannerProps) {
  // Size mappings for common ad formats
  const sizeClasses: Record<string, string> = {
    leaderboard: 'w-full h-24 md:h-28', // 728x90
    rectangle: 'w-full h-64 md:h-80', // 300x250
    square: 'w-full h-64', // 250x250
    skyscraper: 'w-full h-[600px]', // 160x600
    mobile: 'w-full h-20', // Mobile banner
  }

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className="text-center p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {size === 'leaderboard' && '728 × 90'}
          {size === 'rectangle' && '300 × 250'}
          {size === 'square' && '250 × 250'}
          {size === 'skyscraper' && '160 × 600'}
          {size === 'mobile' && '320 × 50'}
        </p>
        {/* Placeholder for actual ad code */}
        {/* Replace this div with your ad code (Google AdSense, etc.) */}
        {/* Example: <div id="ad-slot-1"></div> */}
      </div>
    </div>
  )
}

