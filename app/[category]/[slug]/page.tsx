import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { notFound, redirect } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import { ArticleWithRelations, ArticleListItem } from '@/lib/types'
import CommentsSection from '@/components/CommentsSection'
import ViewCounter from '@/components/ViewCounter'
import AdBanner from '@/components/AdBanner'
import ArticleContent from '@/components/ArticleContent'
import FavoriteButton from '@/components/FavoriteButton'
import { ArticleStructuredData } from '@/components/StructuredData'
import SocialShare from '@/components/SocialShare'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

async function getArticle(categorySlug: string, slug: string): Promise<ArticleWithRelations | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/${categorySlug}/${slug}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Generate static params for ISR - pre-render popular articles
export async function generateStaticParams() {
  try {
    await connectDB()
    
    // Get the most popular articles (top 100) for pre-rendering
    const articles = await Article.find({
      publishedAt: { $ne: null },
    })
      .populate('categoryId', 'slug')
      .sort({ views: -1 })
      .limit(100)
      .select('slug categoryId')
      .lean()

    return articles.map((article: any) => ({
      category: article.categoryId?.slug || 'articles',
      slug: article.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

async function getRelatedArticles(
  article: ArticleWithRelations,
  limit: number = 6
): Promise<ArticleListItem[]> {
  try {
    // Improved related articles algorithm:
    // 1. Same category + shared tags (priority)
    // 2. Same category (fallback)
    // 3. Shared tags only (fallback)
    
    const tagIds = article.tags?.map((tag: any) => tag._id || tag) || []
    const categoryId = article.categoryId?.toString() || article.category?._id?.toString()
    
    // Try to fetch from API with improved query
    const tagSlugs = article.tags?.map((tag: any) => tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-')).filter(Boolean) || []
    const tagQuery = tagSlugs.length > 0 ? `&tag=${tagSlugs[0]}` : ''
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=${article.category.slug}&limit=${limit * 2}${tagQuery}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!res.ok) {
      // Fallback to general articles
      const fallbackRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?limit=${limit}`,
        { next: { revalidate: 3600 } }
      )
      if (!fallbackRes.ok) return []
      const fallbackData = await fallbackRes.json()
      return (fallbackData.articles || [])
        .filter((a: ArticleListItem) => a._id !== article._id)
        .slice(0, limit)
    }
    
    const data = await res.json()
    const articles = (data.articles || [])
      .filter((a: ArticleListItem) => a._id !== article._id)
    
    // Score articles by relevance
    const scoredArticles = articles.map((a: ArticleListItem) => {
      let score = 0
      
      // Same category = 10 points
      if (a.category?.slug === article.category.slug) {
        score += 10
      }
      
      // Shared tags = 5 points each
      const articleTagSlugs = article.tags?.map((t: any) => t.slug || t.name?.toLowerCase().replace(/\s+/g, '-')).filter(Boolean) || []
      const articleTagSlugs_set = new Set(articleTagSlugs)
      const sharedTags = (a.tags || []).filter((t: any) => {
        const tagSlug = t.slug || t.name?.toLowerCase().replace(/\s+/g, '-')
        return articleTagSlugs_set.has(tagSlug)
      }).length
      score += sharedTags * 5
      
      // Views boost = 1 point per 1000 views
      score += (a.views || 0) / 1000
      
      return { ...a, _relevanceScore: score }
    })
    
    // Sort by relevance score and return top results
    return scoredArticles
      .sort((a: any, b: any) => b._relevanceScore - a._relevanceScore)
      .slice(0, limit)
      .map(({ _relevanceScore, ...article }) => article)
  } catch {
    return []
  }
}

async function getPopularArticles(categorySlug: string, excludeId: string, limit: number = 5): Promise<ArticleListItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?category=${categorySlug}&limit=${limit}&sortBy=views&order=desc`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.articles || []).filter(
      (article: ArticleListItem) => article._id !== excludeId
    )
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string }
}): Promise<Metadata> {
  const article = await getArticle(params.category, params.slug)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  // Verify category matches
  if (article.category.slug !== params.category) {
    return {
      title: 'Article Not Found',
    }
  }

  // Handle publishedAt as string or Date
  const publishedTime = article.publishedAt
    ? typeof article.publishedAt === 'string'
      ? new Date(article.publishedAt).toISOString()
      : article.publishedAt.toISOString()
    : undefined

  const articleUrl = `${baseUrl}/${params.category}/${params.slug}`
  const metaDescription = article.excerpt || 
    `${article.title} - Expert advice on ${article.category.name.toLowerCase()}. Read more about ${article.tags.slice(0, 3).map((t: any) => t.name).join(', ')}.`

  // Extract keywords from tags
  const keywords = [
    article.category.name.toLowerCase(),
    ...article.tags.map((tag: any) => tag.name.toLowerCase()),
    'fitness',
    'health',
    'workout',
    'exercise',
    'strength training',
    'bodybuilding',
  ]

  // Generate structured keywords with location context
  const enhancedKeywords = [
    ...keywords,
    `${article.category.name.toLowerCase()} tips`,
    `${article.category.name.toLowerCase()} guide`,
    'fitness blog',
    'health blog',
  ]

  return {
    title: article.title,
    description: metaDescription,
    keywords: enhancedKeywords.join(', '),
    authors: [{ name: article.author?.name || 'Fitness Blog' }],
    openGraph: {
      title: article.title,
      description: metaDescription,
      url: articleUrl,
      siteName: 'Fitness Blog',
      images: article.heroImage
        ? [
            {
              url: article.heroImage.startsWith('http')
                ? article.heroImage
                : `${baseUrl}${article.heroImage}`,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      locale: 'en_US',
      type: 'article',
      publishedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: metaDescription,
      images: article.heroImage
        ? [
            article.heroImage.startsWith('http')
              ? article.heroImage
              : `${baseUrl}${article.heroImage}`,
          ]
        : [],
    },
    alternates: {
      canonical: articleUrl,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { category: string; slug: string }
}) {
  // Prevent conflict with /category/[slug] route
  if (params.category === 'category' || params.category === 'articles' || params.category === 'tools' || params.category === 'account' || params.category === 'login' || params.category === 'register' || params.category === 'search' || params.category === 'about' || params.category === 'contact' || params.category === 'privacy' || params.category === 'terms') {
    notFound()
  }

  const article = await getArticle(params.category, params.slug)

  if (!article) {
    notFound()
  }

  // Verify category matches, redirect if needed
  if (article.category.slug !== params.category) {
    redirect(`/${article.category.slug}/${params.slug}`)
  }

  const relatedArticles = await getRelatedArticles(article, 6)

  const popularArticles = await getPopularArticles(
    params.category,
    article._id.toString(),
    5
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <>
      <ArticleStructuredData article={article} baseUrl={baseUrl} />
      <div className="container mx-auto px-4 py-8">
      {/* Top Banner Ad */}
      <div className="mb-6">
        <AdBanner size="leaderboard" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link
                  href={`/category/${article.category.slug}`}
                  className="text-gray-600 hover:text-primary-600"
                >
                  {article.category.name}
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium" aria-current="page">
                {article.title}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <article>
            <div className="mb-6">
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-block px-3 py-1 text-sm font-semibold text-primary-600 bg-primary-50 rounded-full mb-4 hover:bg-primary-100 transition-colors"
              >
                {article.category.name}
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {article.author?.avatar && (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="font-medium text-gray-900">
                    {article.author?.name || 'Anonymous'}
                  </span>
                </div>
                <span>•</span>
                <time dateTime={article.publishedAt?.toString()}>
                  {article.publishedAt
                    ? format(
                        typeof article.publishedAt === 'string'
                          ? new Date(article.publishedAt)
                          : article.publishedAt,
                        'MMMM d, yyyy'
                      )
                    : 'Draft'}
                </time>
                <span>•</span>
                <ViewCounter slug={`${params.category}/${params.slug}`} />
              </div>
            </div>

            {/* Hero Image */}
            {article.heroImage && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={article.heroImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <ArticleContent content={article.content} />
            </div>

            {/* Tags - Enhanced Display */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-8 border-t border-b border-gray-200 py-6">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: any) => (
                    <Link
                      key={tag._id}
                      href={`/search?tag=${encodeURIComponent(tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 hover:text-primary-800 transition-all duration-200 border border-primary-200 hover:border-primary-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`View articles tagged ${tag.name}`}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="mb-8">
              <SocialShare
                title={article.title}
                url={`${baseUrl}/${article.category.slug}/${article.slug}`}
              />
            </div>

            {/* Favorite Button */}
            <div className="mb-8">
              <FavoriteButton articleId={article._id} />
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-40 space-y-6">
            {/* Popular Articles */}
            {popularArticles.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Popular Articles
                </h3>
                <div className="space-y-4">
                  {popularArticles.map((popularArticle: ArticleListItem, index: number) => (
                    <Link
                      key={popularArticle._id}
                      href={popularArticle.category?.slug ? `/${popularArticle.category.slug}/${popularArticle.slug}` : `/articles/${popularArticle.slug}`}
                      className="block group"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl font-bold text-primary-600 flex-shrink-0 leading-none">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                            {popularArticle.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {popularArticle.views?.toLocaleString() || 0} views
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
             {/* Sidebar Ad */}
             <div className="mt-6">
              <AdBanner size="rectangle" />
            </div>
          </div>
        </aside>
      </div>

      {/* Full Width Sections */}
      {/* Related Articles - Enhanced */}
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                Related Articles
              </h2>
              <p className="text-gray-600">
                Continue reading about {article.category.name.toLowerCase()} and related topics
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle._id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="mt-12">
        <CommentsSection articleSlug={`${params.category}/${params.slug}`} />
      </section>

      {/* FAQ Section */}
      <section className="mt-12">
        <FAQSection
          faqs={[
            {
              question: `What is ${article.category.name.toLowerCase()}?`,
              answer: `Learn more about ${article.category.name.toLowerCase()} and how it relates to fitness and health.`,
            },
            {
              question: `How can I improve my ${article.category.name.toLowerCase()}?`,
              answer: `Follow the guidelines and tips provided in this article to enhance your ${article.category.name.toLowerCase()} journey.`,
            },
            {
              question: 'Are there any risks I should be aware of?',
              answer: 'Always consult with a healthcare professional before starting any new fitness or nutrition program.',
            },
          ]}
        />
      </section>

      {/* Newsletter Section */}
      <section className="mt-12">
        <NewsletterSection />
      </section>
      </div>
    </>
  )
}

