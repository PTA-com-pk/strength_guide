import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

// Legacy route handler for old article URLs: /articles-legacy/slug
// This route exists to avoid conflicts with /articles/[category]/[slug]
async function getArticleCategory(slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/legacy/${slug}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const article = await res.json()
    return article?.category?.slug || null
  } catch {
    return null
  }
}

export default async function LegacyArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const categorySlug = await getArticleCategory(params.slug)
  
  if (categorySlug) {
    redirect(`/${categorySlug}/${params.slug}`)
  }
  
  notFound()
}

