'use client'

import { useState, useEffect } from 'react'
import { getUser } from '@/lib/auth'

interface FavoriteButtonProps {
  articleId: string
  className?: string
}

export default function FavoriteButton({ articleId, className = '' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    if (currentUser) {
      checkFavoriteStatus(currentUser._id)
    }
  }, [articleId])

  const checkFavoriteStatus = async (userId: string) => {
    try {
      const res = await fetch('/api/user/favorites', {
        headers: { 'x-user-id': userId },
      })
      if (res.ok) {
        const data = await res.json()
        const favorited = (data.favorites || []).some(
          (fav: any) => fav._id === articleId || fav._id?.toString() === articleId
        )
        setIsFavorited(favorited)
      } else {
        const errorData = await res.json()
        console.error('Error checking favorite status:', errorData)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user._id,
        },
        body: JSON.stringify({ articleId }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsFavorited(data.favorited)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
        isFavorited
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${className}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        '...'
      ) : isFavorited ? (
        '❤️ Favorited'
      ) : (
        '🤍 Favorite'
      )}
    </button>
  )
}

