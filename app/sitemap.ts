import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    await connectDB()

    // Get all published articles
    const articles = await Article.find({
      publishedAt: { $ne: null },
    })
      .select('slug updatedAt')
      .lean()

    // Get all categories
    const categories = await Category.find()
      .select('slug updatedAt')
      .lean()

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/tools`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Individual tool pages
      {
        url: `${baseUrl}/tools/bmr-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/tools/tdee-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/tools/protein-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/tools/bmi-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/tools/one-rep-max-calculator`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]

    // Article routes - prioritize newer articles
    // Need to populate category to get category slug
    const articlesWithCategory = await Article.find({
      publishedAt: { $ne: null },
    })
      .select('slug updatedAt publishedAt categoryId')
      .populate('categoryId', 'slug')
      .lean()

    const articleRoutes: MetadataRoute.Sitemap = articlesWithCategory.map((article: any) => {
      const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date()
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      // Newer articles get higher priority
      const priority = daysSincePublished < 30 ? 0.9 : daysSincePublished < 90 ? 0.8 : 0.7
      
      const categorySlug = article.categoryId?.slug || 'articles'
      
      return {
        url: `${baseUrl}/${categorySlug}/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority,
      }
    })

    // Category routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...articleRoutes, ...categoryRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static routes on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
