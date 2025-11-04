'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getUser, isAdmin } from '@/lib/auth'
import dynamic from 'next/dynamic'

// Dynamically import the editor to avoid SSR issues
const ArticleEditor = dynamic(() => import('@/components/admin/ArticleEditor'), {
  ssr: false,
})

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState<any>(null)

  const fetchArticle = useCallback(async () => {
    try {
      const user = getUser()
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        headers: {
          'x-user-id': user?._id || '',
        },
      })

      if (res.status === 401) {
        router.push('/login?redirect=/admin/articles')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setArticle(data.article)
      } else {
        alert('Failed to load article')
        router.push('/admin/articles')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      alert('Failed to load article')
    } finally {
      setLoading(false)
    }
  }, [articleId, router])

  useEffect(() => {
    // Check admin access
    const user = getUser()
    if (!user || !isAdmin()) {
      router.push(`/login?redirect=/admin/articles/${articleId}/edit`)
      return
    }

    if (articleId === 'new') {
      setLoading(false)
      return
    }

    fetchArticle()
  }, [router, articleId, fetchArticle])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {articleId === 'new' ? 'Create New Article' : 'Edit Article'}
            </h1>
            <button
              onClick={() => router.push('/admin/articles')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ArticleEditor article={article} articleId={articleId} />
      </div>
    </div>
  )
}

