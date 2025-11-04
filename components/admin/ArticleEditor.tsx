'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import Image from 'next/image'
import MediaSelector from './MediaSelector'

interface ArticleEditorProps {
  article: any
  articleId: string
}

export default function ArticleEditor({ article, articleId }: ArticleEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([])
  const [authors, setAuthors] = useState<Array<{ _id: string; name: string; email: string }>>([])
  const [tags, setTags] = useState<Array<{ _id: string; name: string; slug: string }>>([])

  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    heroImage: article?.heroImage || '',
    heroImageId: article?.heroImageId?._id || article?.heroImageId || '',
    categoryId: article?.categoryId?._id || '',
    authorId: article?.authorId?._id || '',
    tagIds: article?.tagIds?.map((t: any) => t._id) || [],
    publishedAt: article?.publishedAt ? new Date(article.publishedAt).toISOString().split('T')[0] : '',
    proofread: article?.proofread || false,
  })
  const [showPreview, setShowPreview] = useState(false)
  const [showMediaSelector, setShowMediaSelector] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchAuthors()
    fetchTags()
  }, [])

  const fetchCategories = async () => {
    try {
      const user = getUser()
      const res = await fetch('/api/admin/categories', {
        headers: { 'x-user-id': user?._id || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchAuthors = async () => {
    try {
      const user = getUser()
      const res = await fetch('/api/admin/authors', {
        headers: { 'x-user-id': user?._id || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setAuthors(data.authors || [])
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const user = getUser()
      const res = await fetch('/api/admin/tags', {
        headers: { 'x-user-id': user?._id || '' },
      })
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const user = getUser()
      const url = articleId === 'new'
        ? '/api/admin/articles'
        : `/api/admin/articles/${articleId}`

      const method = articleId === 'new' ? 'POST' : 'PUT'

      const payload: any = {
        ...formData,
        publishedAt: formData.publishedAt || null,
      }
      
      // If marking as proofread, set proofread timestamp and user
      if (formData.proofread && !article?.proofread) {
        payload.proofreadAt = new Date().toISOString()
        payload.proofreadBy = user?._id
      } else if (!formData.proofread) {
        // If unchecking, clear proofread data
        payload.proofreadAt = null
        payload.proofreadBy = null
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?._id || '',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        router.push('/admin/articles')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save article')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showPreview ? 'Edit HTML' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <div className="border border-gray-300 rounded-lg p-6 bg-white min-h-[500px]">
              {formData.heroImage && (
                <div className="mb-6">
                  <Image
                    src={formData.heroImage}
                    alt={formData.title}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}
              <h1 className="text-4xl font-bold mb-4">{formData.title}</h1>
              {formData.excerpt && (
                <p className="text-xl text-gray-600 mb-6 italic">{formData.excerpt}</p>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: formData.content }}
                className="article-content"
              />
            </div>
          ) : (
            <>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                HTML content is supported. Use proper HTML tags for formatting. Click "Preview" to see rendered content.
              </p>
            </>
          )}
        </div>

        {/* Hero Image */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Hero Image URL
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMediaSelector(true)}
                className="text-xs px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Select from Library
              </button>
              <Link
                href="/admin/media"
                target="_blank"
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Manage Media →
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.heroImage}
              onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com/image.jpg or /uploads/image.jpg"
            />
            {formData.heroImage && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.heroImage)
                    alert('Image URL copied!')
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy URL"
                >
                  📋
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, heroImage: '', heroImageId: '' })}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  title="Clear"
                >
                  ✕
                </button>
              </>
            )}
          </div>
          {formData.heroImage && (
            <div className="mt-2 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={formData.heroImage}
                alt="Hero preview"
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Category and Author */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <select
              value={formData.authorId}
              onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Author</option>
              {authors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name} ({author.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {tags.map((tag) => (
              <label key={tag._id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tagIds.includes(tag._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        tagIds: [...formData.tagIds, tag._id],
                      })
                    } else {
                      setFormData({
                        ...formData,
                        tagIds: formData.tagIds.filter((id: string) => id !== tag._id),
                      })
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Published Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Published Date (leave empty for draft)
          </label>
          <input
            type="date"
            value={formData.publishedAt}
            onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Proofread Checkbox */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="proofread"
            checked={formData.proofread}
            onChange={(e) => setFormData({ ...formData, proofread: e.target.checked })}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div className="flex-1">
            <label htmlFor="proofread" className="block text-sm font-medium text-gray-700 cursor-pointer">
              Mark as Proofread/Completed
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Check this box when you have completed proofreading this article. This helps track which articles have been reviewed.
            </p>
            {article?.proofread && article?.proofreadAt && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Proofread on {new Date(article.proofreadAt).toLocaleDateString()}
                {article.proofreadBy && (article.proofreadBy as any)?.name && ` by ${(article.proofreadBy as any).name}`}
              </p>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : articleId === 'new' ? 'Create Article' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={(url, mediaId) => {
          setFormData({ ...formData, heroImage: url, heroImageId: mediaId || '' })
          setShowMediaSelector(false)
        }}
        currentUrl={formData.heroImage}
      />
    </form>
  )
}

