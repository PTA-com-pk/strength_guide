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

async function getRelatedArticles(
  categoryId: string,
  excludeId: string,
  limit: number = 3
): Promise<ArticleListItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?limit=${limit}`,
      { next: { revalidate: 3600 } }
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
    keywords: enhancedKeywords,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: metaDescription,
      url: articleUrl,
      siteName: 'StrengthGuide',
      images: article.heroImage ? [
        {
          url: article.heroImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : [],
      type: 'article',
      publishedTime,
      authors: [article.author.name],
      section: article.category.name,
      tags: article.tags.map((tag: any) => tag.name),
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: metaDescription,
      images: article.heroImage ? [article.heroImage] : [],
      creator: article.author.name,
    },
    alternates: {
      canonical: articleUrl,
    },
    // Add article-specific metadata
    other: {
      'article:section': article.category.name,
      'article:tag': article.tags.map((tag: any) => tag.name).join(', '),
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { category: string; slug: string }
}) {
  const article = await getArticle(params.category, params.slug)

  if (!article) {
    notFound()
  }

  // Verify category matches, redirect if needed
  if (article.category.slug !== params.category) {
    redirect(`/${article.category.slug}/${params.slug}`)
  }

  const relatedArticles = await getRelatedArticles(
    article.categoryId.toString(),
    article._id.toString()
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
          <article>
        {/* Hero Image */}
        {article.heroImage && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.heroImage}
              alt={`${article.title} - Featured image`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          {/* Breadcrumbs */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link
                  href={`/category/${article.category.slug}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {article.category.name}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-900 font-medium" aria-current="page">
                {article.title}
              </li>
            </ol>
          </nav>

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link
              href={`/category/${article.category.slug}`}
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              {article.category.name}
            </Link>
            <span>•</span>
            <time dateTime={
              article.publishedAt
                ? new Date(article.publishedAt as string | Date).toISOString()
                : undefined
            }>
              {article.publishedAt &&
                format(new Date(article.publishedAt as string | Date), 'MMMM d, yyyy')}
            </time>
            <span>•</span>
            <ViewCounter slug={`${params.category}/${params.slug}`} />
          </div>

          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white flex-1">
              {article.title}
            </h1>
            <div className="ml-4">
              <FavoriteButton articleId={article._id} />
            </div>
          </div>

          {article.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Author Info */}
          <div className="flex items-center space-x-4">
            {article.author.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {article.author.name}
              </p>
              {article.author.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {article.author.bio}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/tag/${tag.slug}`}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

            {/* Social Share Buttons */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <SocialShare
                url={`${baseUrl}/${params.category}/${params.slug}`}
                title={article.title}
                description={article.excerpt || article.title}
              />
            </div>

            {/* Article Content */}
            <ArticleContent content={article.content} />
          </article>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          {/* Sidebar Ad */}
          <div className="sticky top-24">
            <AdBanner size="rectangle" />
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle._id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* FAQ Section */}
      <FAQSection
        faqs={[
          {
            question: `What is ${article.category.name}?`,
            answer: `${article.category.name} focuses on providing expert advice, proven strategies, and actionable tips to help you achieve your fitness goals. Our articles are written by fitness professionals and backed by scientific research.`,
          },
          {
            question: 'How often are articles updated?',
            answer: 'We regularly update our content to ensure accuracy and relevance. Articles are reviewed and updated based on the latest research and fitness industry best practices.',
          },
          {
            question: 'Can I share these articles?',
            answer: 'Yes! You can share our articles using the social share buttons provided. We encourage sharing helpful content with your fitness community.',
          },
          {
            question: 'Do you have more articles on this topic?',
            answer: `Yes! Browse our ${article.category.name} category to find more related articles, or use the search function to explore specific topics.`,
          },
          {
            question: 'How can I get personalized fitness advice?',
            answer: 'While our articles provide general guidance, for personalized fitness plans, we recommend consulting with a certified fitness professional or using our fitness calculators for specific calculations.',
          },
        ]}
      />

      {/* Comments Section */}
      <CommentsSection articleSlug={`${params.category}/${params.slug}`} />
    </div>
    </>
  )
}

