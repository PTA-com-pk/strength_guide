import { Metadata } from 'next'
import { Suspense } from 'react'
import ArticleCard from '@/components/ArticleCard'
import { ArticleListItem } from '@/lib/types'
import Link from 'next/link'
import AdBanner from '@/components/AdBanner'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'
import Pagination from '@/components/Pagination'

export const metadata: Metadata = {
  title: 'All Articles - StrengthGuide',
  description: 'Browse all fitness articles, workouts, nutrition tips, and training guides.',
}

async function getArticles(page: number = 1, sortBy: string = 'publishedAt', order: string = 'desc') {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?page=${page}&limit=12&sortBy=${sortBy}&order=${order}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { articles: [], pagination: null }
    const data = await res.json()
    return {
      articles: data.articles || [],
      pagination: data.pagination || null,
    }
  } catch {
    return { articles: [], pagination: null }
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data || []
  } catch {
    return []
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string; sortBy?: string; order?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const sortBy = searchParams.sortBy || 'publishedAt'
  const order = searchParams.order || 'desc'

  const [{ articles, pagination }, categories] = await Promise.all([
    getArticles(page, sortBy, order),
    getCategories(),
  ])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            All Articles
          </h1>
          <p className="text-xl text-gray-300">
            Browse our complete collection of fitness articles, workouts, and nutrition guides
          </p>
        </div>
      </section>

      {/* Top Banner Ad */}
      <div className="container mx-auto px-4 py-4">
        <AdBanner size="leaderboard" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {articles.length} of {pagination?.total || 0} articles
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Link
                  href={`/articles?sortBy=publishedAt&order=desc${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                    sortBy === 'publishedAt'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Latest
                </Link>
                <Link
                  href={`/articles?sortBy=views&order=desc${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                    sortBy === 'views'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Most Popular
                </Link>
              </div>
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {articles.map((article: ArticleListItem) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      baseUrl="/articles"
                      searchParams={{ sortBy, order }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">No articles found.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Go to Home
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-4 pb-2 border-b-2 border-primary-500">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category: any) => (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="block text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {category.name} ({category.articleCount || 0})
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Ad */}
            <div className="mb-8">
              <AdBanner size="rectangle" />
            </div>
          </aside>
        </div>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* FAQ Section */}
        <FAQSection
          faqs={[
            {
              question: 'How many articles do you have?',
              answer: `We have ${pagination?.total || 0} articles covering various fitness topics including muscle building, fat loss, nutrition, training, supplements, and workouts. New content is added regularly.`,
            },
            {
              question: 'How do I filter articles?',
              answer: 'You can filter articles by category using the sidebar, sort by date or popularity using the dropdown menu, and use the search bar to find specific topics.',
            },
            {
              question: 'Are the articles free to read?',
              answer: 'Yes! All our articles are completely free to read. No sign-up or subscription required.',
            },
            {
              question: 'How often are new articles published?',
              answer: 'We publish new articles regularly, typically multiple times per week. Subscribe to our newsletter to stay updated on new content.',
            },
            {
              question: 'Can I save articles for later?',
              answer: 'Yes! Create a free account to save your favorite articles, leave comments, and track your reading history.',
            },
          ]}
        />
      </div>
    </div>
  )
}

