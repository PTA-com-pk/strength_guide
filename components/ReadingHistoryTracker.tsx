'use client'

import { useEffect } from 'react'
import { getUser } from '@/lib/auth'

interface ReadingHistoryTrackerProps {
  articleId: string
}

export default function ReadingHistoryTracker({ articleId }: ReadingHistoryTrackerProps) {
  useEffect(() => {
    const user = getUser()
    if (!user) return

    // Track reading history
    const trackReading = async () => {
      try {
        await fetch('/api/user/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user._id,
          },
          body: JSON.stringify({ articleId }),
        })
      } catch (error) {
        console.error('Error tracking reading history:', error)
      }
    }

    trackReading()
  }, [articleId])

  return null
}

