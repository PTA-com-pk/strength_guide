'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { format } from 'date-fns'
import { getUser } from '@/lib/auth'

interface Comment {
  id: string
  name: string
  email: string
  content: string
  createdAt: string
}

interface CommentsSectionProps {
  articleSlug: string
}

// Helper function to get anonymous email for non-logged-in users
const getAnonymousEmail = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('comment_session_id')
    if (!sessionId) {
      sessionId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('comment_session_id', sessionId)
    }
    return `${sessionId}@noreply.local`
  }
  return `anonymous-${Date.now()}@noreply.local`
}

export default function CommentsSection({ articleSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      // Handle both old format (just slug) and new format (category/slug)
      const apiSlug = articleSlug.includes('/') ? articleSlug : `legacy/${articleSlug}`
      const res = await fetch(`/api/articles/${apiSlug}/comments`)
      if (res.ok) {
        const data = await res.json()
        // Ensure comments are properly formatted
        const formattedComments = (data.comments || []).map((comment: any) => ({
          id: comment.id || comment._id?.toString() || Math.random().toString(),
          name: comment.name || 'Anonymous',
          email: comment.email || '',
          content: comment.content || '',
          createdAt: comment.createdAt || new Date().toISOString(),
        }))
        setComments(formattedComments)
      } else {
        console.error('Failed to fetch comments:', res.statusText)
        setComments([])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [articleSlug])

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    // Always set name and email - use user info if logged in, or defaults for anonymous
    setFormData({
      name: currentUser?.name || 'Anonymous User',
      email: currentUser?.email || getAnonymousEmail(),
      content: '',
    })
    fetchComments()
  }, [articleSlug, fetchComments])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add user ID header if authenticated
    if (user) {
      headers['x-user-id'] = user._id
    }

    try {
      // Handle both old format (just slug) and new format (category/slug)
      const apiSlug = articleSlug.includes('/') ? articleSlug : `legacy/${articleSlug}`
      const res = await fetch(`/api/articles/${apiSlug}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        
        // Reset only content, keep name/email for user
        const currentUser = getUser()
        setFormData({
          name: currentUser?.name || 'Anonymous User',
          email: currentUser?.email || getAnonymousEmail(),
          content: '',
        })
        
        // Show success message
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 5000)
        
        // If comment was auto-approved, refresh comments immediately
        // Otherwise, show that it needs moderation
        if (data.comment?.approved) {
          setTimeout(() => fetchComments(), 500)
        }
      } else {
        // Handle error response
        const errorData = await res.json().catch(() => ({ error: 'Failed to submit comment' }))
        setError(errorData.error || 'Failed to submit comment. Please try again.')
        setTimeout(() => setError(null), 5000)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      setError('Network error. Please check your connection and try again.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
        {user && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Commenting as <span className="font-semibold">{user.name || user.email}</span>
          </p>
        )}
        <textarea
          placeholder="Your Comment"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white mb-4"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Post Comment'}
        </button>
        {submitted && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            {user 
              ? 'Comment posted successfully!' 
              : 'Comment submitted! It will appear after moderation.'}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* Comments List */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {comment.name}
                  </h4>
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                  </time>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      )}
    </section>
  )
}

