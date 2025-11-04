import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'

// Force dynamic rendering - sitemap needs database access
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Define fallback routes that don't require database
  const fallbackRoutes: MetadataRoute.Sitemap = [
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

  // Check if MongoDB URI is available before attempting connection
  const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!MONGODB_URI) {
    // Return fallback routes if no database connection available
    return fallbackRoutes
  }

  try {
    // Set a timeout for database connection (8 seconds for build time)
    const timeoutMs = 8000
    const connectPromise = connectDB()
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs)
    )
    
    await Promise.race([connectPromise, timeoutPromise])

    // Get all published articles with category info
    const articlesWithCategory = await Article.find({
      publishedAt: { $ne: null },
    })
      .select('slug updatedAt publishedAt categoryId')
      .populate('categoryId', 'slug')
      .lean()
      .limit(5000) // Limit to prevent memory issues during build

    // Get all categories
    const categories = await Category.find()
      .select('slug updatedAt')
      .lean()

    // Article routes - prioritize newer articles
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
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...fallbackRoutes, ...articleRoutes, ...categoryRoutes]
  } catch (error: any) {
    // Log error but don't fail the build - return fallback routes
    const errorMessage = error?.message || String(error)
    if (!errorMessage.includes('timeout') && !errorMessage.includes('MongoDB') && !errorMessage.includes('ECONNREFUSED')) {
      console.error('Error generating sitemap:', errorMessage)
    }
    
    // Return fallback routes - ensures build doesn't fail
    return fallbackRoutes
  }
}
