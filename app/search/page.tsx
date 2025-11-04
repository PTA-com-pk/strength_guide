import { Metadata } from 'next'
import ArticleCard from '@/components/ArticleCard'
import { ArticleListItem } from '@/lib/types'
import FAQSection from '@/components/FAQSection'
import NewsletterSection from '@/components/NewsletterSection'

export const metadata: Metadata = {
  title: 'Search - StrengthGuide',
  description: 'Search for articles, workouts, and fitness advice.',
}

async function searchArticles(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/search?q=${encodeURIComponent(query)}&limit=20`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.articles || []
  } catch {
    return []
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  const articles = await searchArticles(query)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Search Results
      </h1>

      {query ? (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Found {articles.length} result{articles.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: ArticleListItem) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No articles found matching your search.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Try different keywords or browse our categories.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search query to find articles.
          </p>
        </div>
      )}

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* FAQ Section */}
      <FAQSection
        faqs={[
          {
            question: 'How does the search work?',
            answer: 'Our search searches through article titles, content, and tags to find the most relevant results. Try using specific keywords for better results.',
          },
          {
            question: 'Can I search by category?',
            answer: 'Yes! You can browse articles by category using the category links in the navigation menu, or include category names in your search query.',
          },
          {
            question: 'Why am I not finding results?',
            answer: 'Try using different keywords, check your spelling, or use broader search terms. You can also browse by category to find related articles.',
          },
          {
            question: 'Can I save search results?',
            answer: 'Yes! Click the favorite icon on any article to save it to your account. You can access saved articles anytime from your account page.',
          },
          {
            question: 'Are search results sorted by relevance?',
            answer: 'Search results are sorted by relevance, matching your query to article titles, content, and tags. Popular articles may also appear higher in results.',
          },
        ]}
      />
    </div>
  )
}

