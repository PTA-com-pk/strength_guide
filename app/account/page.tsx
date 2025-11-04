'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUser, removeUser } from '@/lib/auth'
import ArticleCard from '@/components/ArticleCard'
import { ArticleListItem } from '@/lib/types'
import SettingsTab from '@/components/SettingsTab'
import NewsletterSection from '@/components/NewsletterSection'
import FAQSection from '@/components/FAQSection'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'comments' | 'settings'>('profile')
  const [favorites, setFavorites] = useState<ArticleListItem[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadUserData(currentUser._id)
  }, [router])

  const loadUserData = async (userId: string) => {
    try {
      // Load favorites
      const favRes = await fetch('/api/user/favorites', {
        headers: { 'x-user-id': userId },
      })
      if (favRes.ok) {
        const favData = await favRes.json()
        setFavorites(favData.favorites || [])
      } else {
        const errorData = await favRes.json()
        console.error('Error loading favorites:', errorData)
      }

      // Load comments
      const commentsRes = await fetch('/api/user/comments', {
        headers: { 'x-user-id': userId },
      })
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.comments || [])
      } else {
        const errorData = await commentsRes.json()
        console.error('Error loading comments:', errorData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeUser()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary-600 text-2xl font-black">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1">{user.name || 'User'}</h1>
              <p className="text-primary-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'favorites'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ❤️ Favorites ({favorites.length})
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'comments'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💬 My Comments ({comments.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  🚪 Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-black text-gray-900 mb-6">Profile</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                    <p className="text-gray-900 text-lg">{user.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900 text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-900 text-lg">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      {user.role || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-black text-gray-900 mb-6">Favorite Articles</h2>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((article: ArticleListItem) => (
                      <ArticleCard key={article._id} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven't favorited any articles yet.</p>
                    <Link
                      href="/articles"
                      className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      Browse Articles
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-black text-gray-900 mb-6">My Comments</h2>
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <div key={comment._id} className="border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            href={comment.article?.slug ? (comment.article.slug.includes('/') ? `/${comment.article.slug}` : `/articles/${comment.article.slug}`) : '#'}
                            className="font-bold text-primary-600 hover:underline"
                          >
                            {comment.article.title}
                          </Link>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              comment.approved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {comment.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">You haven't commented on any articles yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* FAQ Section */}
        <FAQSection
          faqs={[
            {
              question: 'How do I update my profile information?',
              answer: 'Go to the Settings tab in your account page. You can update your name, bio, avatar, and password from there.',
            },
            {
              question: 'How do I save articles?',
              answer: 'Click the favorite/heart icon on any article to save it to your favorites. You can view all saved articles in the Favorites tab.',
            },
            {
              question: 'Can I delete my account?',
              answer: 'Yes, you can delete your account from the Settings tab. This will permanently remove all your data including saved articles and comments.',
            },
            {
              question: 'How do I change my password?',
              answer: 'Go to Settings and use the "Change Password" section. You\'ll need to enter your current password and create a new one.',
            },
            {
              question: 'Where can I see my calculator history?',
              answer: 'Your calculator history is automatically saved when you use our fitness calculators. View it in the Calculator History section on your account page.',
            },
          ]}
        />
      </div>
    </div>
  )
}
