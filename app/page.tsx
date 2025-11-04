import { Metadata } from 'next'
import ArticleCard from '@/components/ArticleCard'
import { ArticleListItem } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import AdBanner from '@/components/AdBanner'
import NewsletterSection from '@/components/NewsletterSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover expert fitness advice, workout plans, nutrition guides, and strength training tips. Build muscle, lose fat, and achieve your fitness goals with StrengthGuide.',
  keywords: ['fitness', 'workout plans', 'muscle building', 'fat loss', 'nutrition', 'strength training', 'exercise', 'health'],
  openGraph: {
    title: 'StrengthGuide - Your Ultimate Strength Training Resource',
    description: 'Discover expert fitness advice, workout plans, nutrition guides, and strength training tips.',
    url: baseUrl,
    siteName: 'StrengthGuide',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'StrengthGuide - Fitness and Health Resources',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StrengthGuide - Your Ultimate Strength Training Resource',
    description: 'Discover expert fitness advice, workout plans, nutrition guides, and strength training tips.',
    images: [`${baseUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: baseUrl,
  },
}

async function getFeaturedArticle() {
  try {
    // Fetch top 20 articles by views, then randomly select one
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?limit=20&sortBy=views&order=desc`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })
    if (!res.ok) return null
    const data = await res.json()
    const articles = data.articles || []
    if (articles.length === 0) return null
    
    // Randomly select one article from the top articles
    const randomIndex = Math.floor(Math.random() * articles.length)
    return articles[randomIndex] || null
  } catch {
    return null
  }
}

async function getRecentArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?limit=4`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

async function getPopularArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/popular?limit=5`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
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

async function getTrendingArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?limit=4&sortBy=views&order=desc`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

async function getWorkoutArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=workouts&limit=3`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featuredArticle, recentArticles, popularArticles, categories, trendingArticles, workoutArticles] = await Promise.all([
    getFeaturedArticle(),
    getRecentArticles(),
    getPopularArticles(),
    getCategories(),
    getTrendingArticles(),
    getWorkoutArticles(),
  ])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner Section */}
      {featuredArticle && (
        <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-full mb-4 uppercase tracking-wide">
                  Featured Article
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                  {featuredArticle.title}
                </h1>
                <p className="text-xl text-gray-300 mb-6 line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center space-x-6 mb-6 text-sm">
                  <div className="flex items-center space-x-2">
                    {featuredArticle.author.avatar && (
                      <Image
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <span className="font-semibold">{featuredArticle.author.name}</span>
                  </div>
                  <span className="text-gray-400">
                    {new Date(featuredArticle.publishedAt!).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <Link
                  href={featuredArticle.category?.slug ? `/${featuredArticle.category.slug}/${featuredArticle.slug}` : `/articles/${featuredArticle.slug}`}
                  className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors text-lg"
                >
                  Read Full Article →
                </Link>
              </div>
              {featuredArticle.heroImage && (
                <div className="relative h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={featuredArticle.heroImage}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Ad Below Featured Article */}
            {featuredArticle && (
              <div className="mb-8">
                <AdBanner size="rectangle" />
              </div>
            )}

            {/* Latest Articles */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                  Latest Articles
                </h2>
                <Link
                  href="/articles"
                  className="text-primary-600 hover:text-primary-700 font-bold text-lg"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentArticles.length > 0 ? (
                  recentArticles.map((article: ArticleListItem) => (
                    <ArticleCard key={article._id} article={article} />
                  ))
                ) : (
                  <p className="text-gray-600 col-span-2">
                    No articles found. Check back soon!
                  </p>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-8">
              {/* Popular Articles */}
              {popularArticles.length > 0 && (
                <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b-2 border-primary-500">
                    Most Popular
                  </h3>
                  <div className="space-y-4">
                    {popularArticles.map((article: ArticleListItem, index: number) => (
                      <Link
                        key={article._id}
                        href={article.category?.slug ? `/${article.category.slug}/${article.slug}` : `/articles/${article.slug}`}
                        className="block group"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-3xl font-black text-primary-600 flex-shrink-0 leading-none">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {article.views.toLocaleString()} views
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Newsletter Signup */}
              <section className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-xl p-8 text-white">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black mb-2">Get Free Workouts</h3>
                  <p className="text-primary-100 text-sm">
                    Join 100,000+ subscribers getting the latest fitness tips delivered to their inbox.
                  </p>
                </div>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                  >
                    Subscribe Now
                  </button>
                </form>
                <p className="text-xs text-primary-200 text-center mt-4">
                  No spam. Unsubscribe anytime.
                </p>
              </section>

              {/* Sidebar Ad */}
              <div>
                <AdBanner size="rectangle" />
              </div>

              {/* Small Sidebar Ad */}
              <div>
                <AdBanner size="square" />
              </div>
            </div>
          </aside>
        </div>

        {/* Trending Articles - Full Width */}
        {trendingArticles.length > 0 && (
          <section className="mb-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                  🔥 Trending Now
                </h2>
                <Link
                  href="/articles?sortBy=views&order=desc"
                  className="text-primary-600 hover:text-primary-700 font-bold text-lg"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingArticles.slice(0, 4).map((article: ArticleListItem) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Workouts - Full Width */}
        {workoutArticles.length > 0 && (
          <section className="mb-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                  💪 Featured Workouts
                </h2>
                <Link
                  href="/category/workouts"
                  className="text-primary-600 hover:text-primary-700 font-bold text-lg"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {workoutArticles.map((article: ArticleListItem) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Grid - Full Width */}
        {categories.length > 0 && (
          <section className="mb-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category: any) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="group bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-500"
                  >
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors text-lg">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.articleCount || 0} articles
                    </p>
                    <span className="text-primary-600 font-semibold text-sm group-hover:underline">
                      Explore →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA Section */}
        <NewsletterSection 
          title="Get Weekly Fitness Tips Delivered to Your Inbox"
          description="Join thousands of fitness enthusiasts getting expert advice, workout plans, and nutrition tips every week."
        />

      
      </div>
    </div>
  )
}
