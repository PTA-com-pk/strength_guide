'use client'

import { useEffect, useState } from 'react'

interface ViewCounterProps {
  slug: string
}

export default function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    // Handle both old format (just slug) and new format (category/slug)
    const apiSlug = slug.includes('/') ? slug : `legacy/${slug}`
    // Increment view count
    fetch(`/api/articles/${apiSlug}/view`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.views !== undefined) {
          setViews(data.views)
        }
      })
      .catch((error) => {
        console.error('Error incrementing view count:', error)
      })
  }, [slug])

  if (views === null) {
    return <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
  }

  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {views.toLocaleString()} views
    </span>
  )
}

