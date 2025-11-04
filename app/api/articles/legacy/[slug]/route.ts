import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
// Import all models to ensure they're registered
import '@/models/Author'
import '@/models/Category'
import '@/models/Tag'
import '@/models/Comment'
import '@/models/Media'
import Article from '@/models/Article'
import { ArticleWithRelations } from '@/lib/types'

// Legacy route handler - supports old URLs without category
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()

    const article = await Article.findOne({
      slug: params.slug,
      publishedAt: { $ne: null },
    })
      .populate('authorId')
      .populate('categoryId')
      .populate('tagIds')
      .populate({
        path: 'heroImageId',
        select: 'filename url mimeType',
        strictPopulate: false,
      })
      .lean()

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Get approved comments
    const Comment = (await import('@/models/Comment')).default
    const comments = await Comment.find({
      articleId: article._id,
      approved: true,
    })
      .sort({ createdAt: -1 })
      .lean()

    // Prioritize Cloudinary URL, then heroImageId URL, then heroImage field
    let heroImageUrl = article.heroImage
    if (article.heroImageId && typeof article.heroImageId === 'object' && 'url' in article.heroImageId) {
      const mediaUrl = (article.heroImageId as any).url
      // If Media has Cloudinary URL, use it; otherwise use Media URL or fallback to heroImage
      if (mediaUrl && mediaUrl.includes('res.cloudinary.com')) {
        heroImageUrl = mediaUrl
      } else if (mediaUrl) {
        heroImageUrl = mediaUrl
      }
    }
    // Check if heroImage field itself is Cloudinary URL
    if (article.heroImage && article.heroImage.includes('res.cloudinary.com')) {
      heroImageUrl = article.heroImage
    }

    const articleWithRelations: ArticleWithRelations = {
      ...article,
      _id: article._id.toString(),
      authorId: article.authorId as any,
      categoryId: article.categoryId as any,
      tagIds: article.tagIds as any,
      author: article.authorId as any,
      category: article.categoryId as any,
      tags: article.tagIds as any,
      comments: comments as any,
      heroImage: heroImageUrl || article.heroImage, // Use database URL if available
    }

    return NextResponse.json(articleWithRelations)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

