'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUser, isAdmin } from '@/lib/auth'
import dynamic from 'next/dynamic'

const ArticleEditor = dynamic(() => import('@/components/admin/ArticleEditor'), {
  ssr: false,
})

export default function NewArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check admin access
    const user = getUser()
    if (!user || !isAdmin()) {
      router.push('/login?redirect=/admin/articles/new')
      return
    }
    setLoading(false)
  }, [router])

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
            <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
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
        <ArticleEditor article={null} articleId="new" />
      </div>
    </div>
  )
}

