import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import { ArticleListItem } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import AdBanner from '@/components/AdBanner'
import { BreadcrumbStructuredData } from '@/components/StructuredData'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'
import Pagination from '@/components/Pagination'

async function getCategory(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const categories = await res.json()
    return categories.find((cat: any) => cat.slug === slug) || null
  } catch {
    return null
  }
}

async function getFeaturedArticle(slug: string) {
  try {
    // Fetch top 10 articles by views from this category, then randomly select one
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=${slug}&limit=10&sortBy=views&order=desc`,
      { next: { revalidate: 300 } } // Revalidate every 5 minutes
    )
    if (!res.ok) return null
    const data = await res.json()
    const articles = data.articles || []
    if (articles.length === 0) return null
    
    // Randomly select one article from the top articles in this category
    const randomIndex = Math.floor(Math.random() * articles.length)
    return articles[randomIndex] || null
  } catch {
    return null
  }
}

async function getPopularArticles(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=${slug}&limit=4&sortBy=views&order=desc`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

async function getArticles(slug: string, page: number = 1, sortBy: string = 'publishedAt') {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=${slug}&page=${page}&limit=12&sortBy=${sortBy}&order=desc`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return { articles: [], pagination: null }
    return await res.json()
  } catch {
    return { articles: [], pagination: null }
  }
}

async function getTags() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tags`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.tags || []
  } catch {
    return []
  }
}

async function getRelatedCategories(currentSlug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const categories = await res.json()
    return categories.filter((cat: any) => cat.slug !== currentSlug).slice(0, 5)
  } catch {
    return []
  }
}

async function getRandomCategoryHeroImage(categorySlug: string) {
  try {
    // Fetch articles with hero images from this category
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=${categorySlug}&limit=50`,
      { 
        // Revalidate every 5 minutes to allow random selection variation
        next: { revalidate: 300 }
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const articlesWithImages = (data.articles || []).filter(
      (article: ArticleListItem) => 
        article.heroImage && 
        (article.heroImage.startsWith('/images/articles') || 
         article.heroImage.includes('res.cloudinary.com'))
    )
    
    if (articlesWithImages.length === 0) return null
    
    // Randomly select one article's hero image
    const randomIndex = Math.floor(Math.random() * articlesWithImages.length)
    return articlesWithImages[randomIndex].heroImage
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const category = await getCategory(params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  const categoryUrl = `${baseUrl}/category/${params.slug}`
  const metaDescription = category.description || 
    `Browse expert articles and guides about ${category.name.toLowerCase()}. Find the latest tips, workouts, and advice on ${category.name.toLowerCase()}.`

  return {
    title: `${category.name} Articles`,
    description: metaDescription,
    keywords: [category.name.toLowerCase(), 'fitness', 'health', 'workout', 'exercise'],
    openGraph: {
      title: `${category.name} Articles - StrengthGuide`,
      description: metaDescription,
      url: categoryUrl,
      siteName: 'StrengthGuide',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} Articles - StrengthGuide`,
      description: metaDescription,
    },
    alternates: {
      canonical: categoryUrl,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string; sort?: string }
}) {
  const category = await getCategory(params.slug)
  const page = parseInt(searchParams.page || '1')
  const sortBy = searchParams.sort || 'publishedAt'
  
  const [featuredArticle, popularArticles, { articles, pagination }, tags, relatedCategories, randomHeroImage] = 
    await Promise.all([
      getFeaturedArticle(params.slug),
      getPopularArticles(params.slug),
      getArticles(params.slug, page, sortBy),
      getTags(),
      getRelatedCategories(params.slug),
      getRandomCategoryHeroImage(params.slug),
    ])

  if (!category) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: category.name, url: `${baseUrl}/category/${params.slug}` },
  ]

  // Use random hero image from category articles, fallback to static category image
  const categoryImage = randomHeroImage || `/images/categories/${category.slug}.jpg`

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <div className="bg-gray-50 min-h-screen">
      {/* Category Hero Banner */}
      <section 
        className="relative text-white py-12 md:py-16 overflow-hidden bg-gradient-to-r from-dark-900 to-dark-800"
        style={{
          backgroundImage: `url(${categoryImage}), linear-gradient(to right, rgb(17, 24, 39), rgb(31, 41, 55))`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/85 via-dark-800/75 to-dark-900/85 z-0" />
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            {/* Breadcrumbs */}
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-300">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-white font-medium" aria-current="page">
                  {category.name}
                </li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-gray-300 mb-4">
                {category.description}
              </p>
            )}
            <p className="text-gray-400">
              {pagination?.total || 0} expert articles to help you achieve your fitness goals
            </p>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <div className="container mx-auto px-4 py-4">
        <AdBanner size="leaderboard" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Article */}
            {featuredArticle && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                    Featured Article
                  </h2>
                </div>
                <Link href={featuredArticle.category?.slug ? `/${featuredArticle.category.slug}/${featuredArticle.slug}` : `/articles/${featuredArticle.slug}`}>
                  <div className="bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-gray-200">
                    {featuredArticle.heroImage && (
                      <div className="relative h-64 md:h-80 overflow-hidden">
                        <Image
                          src={featuredArticle.heroImage}
                          alt={featuredArticle.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                            {featuredArticle.title}
                          </h3>
                          <p className="text-gray-200 line-clamp-2">
                            {featuredArticle.excerpt}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </section>
            )}

            {/* Most Popular Articles */}
            {popularArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                  Most Popular
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularArticles.map((article: ArticleListItem) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            

            {/* Popular Tags */}
            {tags.length > 0 && (
              <section className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-4 pb-2 border-b-2 border-primary-500">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((tag: any) => (
                    <Link
                      key={tag._id}
                      href={`/search?q=${encodeURIComponent(tag.name)}`}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Categories */}
            {relatedCategories.length > 0 && (
              <section className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-4 pb-2 border-b-2 border-primary-500">
                  Related Categories
                </h3>
                <ul className="space-y-2">
                  {relatedCategories.map((cat: any) => (
                    <li key={cat._id}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                      >
                        {cat.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({cat.articleCount || 0})
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Newsletter Signup */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-xl p-6 text-white">
              <h3 className="text-xl font-black mb-2">Stay Updated</h3>
              <p className="text-primary-100 text-sm mb-4">
                Get the latest {category.name.toLowerCase()} tips delivered to your inbox.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-bold"
                >
                  Subscribe
                </button>
              </form>
            </section>
            {/* Sidebar Ad */}
            <div className="mb-8 mt-8">
              <AdBanner size="rectangle" />
            </div>
          </aside>
        </div>

        {/* Latest Articles Section - Full Width */}
        <section className="mb-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Latest Articles
              </h2>
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Link
                  href={`/category/${params.slug}?sort=publishedAt${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1 text-sm rounded font-semibold transition-colors ${
                    sortBy === 'publishedAt'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={`/category/${params.slug}?sort=views${page > 1 ? `&page=${page}` : ''}`}
                  className={`px-3 py-1 text-sm rounded font-semibold transition-colors ${
                    sortBy === 'views'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Most Viewed
                </Link>
              </div>
            </div>

            {articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                      baseUrl={`/category/${params.slug}`}
                      searchParams={sortBy !== 'publishedAt' ? { sort: sortBy } : {}}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-gray-600">
                  No articles found in this category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* FAQ Section */}
        <FAQSection
          faqs={[
            {
              question: `What is ${category.name}?`,
              answer: `${category.name} is a category focused on providing expert fitness advice, proven strategies, and actionable tips. Our articles cover various aspects of this topic to help you achieve your fitness goals.`,
            },
            {
              question: `How many articles are in ${category.name}?`,
              answer: `We currently have ${pagination?.total || 0} articles in the ${category.name} category, with new content added regularly.`,
            },
            {
              question: 'How do I find specific articles?',
              answer: 'You can browse articles by category, use the search function, or filter articles by popularity or date. Each article includes tags and categories to help you find related content.',
            },
            {
              question: 'Are the articles written by experts?',
              answer: 'Yes! All our articles are written by certified fitness professionals, nutritionists, and fitness experts. Content is reviewed for accuracy and backed by scientific research.',
            },
            {
              question: 'Can I request a specific topic?',
              answer: 'We welcome topic suggestions! Feel free to contact us through our contact page or reach out via social media with your ideas.',
            },
          ]}
        />
      </div>
    </div>
    </>
  )
}
