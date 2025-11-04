import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'

export async function POST(
  request: NextRequest,
  { params }: { params: { category: string; slug: string } }
) {
  try {
    await connectDB()

    // Verify category exists
    const category = await Category.findOne({ slug: params.category }).lean()
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const article = await Article.findOne({
      slug: params.slug,
      categoryId: category._id,
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    article.views = (article.views || 0) + 1
    await article.save()

    return NextResponse.json({ views: article.views })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}

