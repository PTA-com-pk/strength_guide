import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
// Import all models to ensure they're registered
import '@/models/Author'
import '@/models/Category'
import '@/models/Tag'
import '@/models/Comment'
import Article from '@/models/Article'
import Category from '@/models/Category'

// Cache for 5 minutes (300 seconds)
export const revalidate = 300

export async function GET() {
  try {
    await connectDB()

    // Get all categories in parallel
    const categories = await Category.find().lean()
    
    const megaMenuData: Record<string, { description: string; links: Array<{ name: string; href: string }> }> = {}

    // Fetch articles for all categories in parallel using Promise.all
    const categoryPromises = categories.map(async (category) => {
      // Fetch popular articles from this category (by views, limit to 6)
      // No need to populate categoryId since we already have the slug
      const articles = await Article.find({
        categoryId: category._id,
        publishedAt: { $ne: null },
      })
        .sort({ views: -1 })
        .limit(6)
        .select('title slug')
        .lean()

      // Map articles to menu links
      const links = articles.map((article: any) => ({
        name: article.title,
        href: `/${category.slug}/${article.slug}`,
      }))

      return {
        slug: category.slug,
        description: category.description || `Explore ${category.name} articles, guides, and expert advice.`,
        links,
      }
    })

    // Wait for all category queries to complete in parallel
    const results = await Promise.all(categoryPromises)
    
    // Build the response object
    results.forEach((result) => {
      megaMenuData[result.slug] = {
        description: result.description,
        links: result.links,
      }
    })

    return NextResponse.json(megaMenuData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching mega menu data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mega menu data' },
      { status: 500 }
    )
  }
}

