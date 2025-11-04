import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
// Import all models to ensure they're registered
import '@/models/Author'
import '@/models/Category'
import '@/models/Tag'
import '@/models/Comment'
import '@/models/Media'
import Article from '@/models/Article'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import { ArticleListItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    const query: any = {
      publishedAt: { $ne: null },
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        query.categoryId = categoryDoc._id
      } else {
        return NextResponse.json({
          articles: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }

    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag })
      if (tagDoc) {
        query.tagIds = tagDoc._id
      } else {
        return NextResponse.json({
          articles: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }

    // Build sort
    const sort: any = {}
    if (sortBy === 'views') {
      sort.views = order === 'asc' ? 1 : -1
    } else {
      sort.publishedAt = order === 'asc' ? 1 : -1
    }

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('authorId', 'name avatar')
        .populate('categoryId', 'name slug')
        .populate('tagIds', 'name slug')
        .populate({
          path: 'heroImageId',
          select: 'filename url mimeType',
          strictPopulate: false,
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ])

    // Get comment counts
    const { default: Comment } = await import('@/models/Comment')
    const articleIds = articles.map((a: any) => a._id)
    const commentCounts = await Comment.aggregate([
      { $match: { articleId: { $in: articleIds }, approved: true } },
      { $group: { _id: '$articleId', count: { $sum: 1 } } },
    ])
    const commentCountMap = new Map(
      commentCounts.map((c: any) => [c._id.toString(), c.count])
    )

    // Transform to ArticleListItem format
    const formattedArticles: ArticleListItem[] = articles.map((article: any) => {
      // Handle populated fields - they might be ObjectIds or populated objects
      const author = article.authorId?._id 
        ? { _id: article.authorId._id.toString(), name: article.authorId.name, avatar: article.authorId.avatar }
        : { _id: article.authorId?.toString() || '', name: '', avatar: '' }
      
      const category = article.categoryId?._id
        ? { _id: article.categoryId._id.toString(), name: article.categoryId.name, slug: article.categoryId.slug }
        : { _id: article.categoryId?.toString() || '', name: '', slug: '' }
      
      const tags = Array.isArray(article.tagIds) 
        ? article.tagIds.map((tag: any) => ({
            _id: tag?._id ? tag._id.toString() : tag?.toString() || '',
            name: tag?.name || '',
            slug: tag?.slug || '',
          }))
        : []

      // Prioritize Cloudinary URL, then heroImageId URL, then heroImage field
      let heroImageUrl = article.heroImage
      if (article.heroImageId && typeof article.heroImageId === 'object' && 'url' in article.heroImageId) {
        const mediaUrl = article.heroImageId.url
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

      return {
        _id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        heroImage: heroImageUrl,
        publishedAt: article.publishedAt,
        views: article.views || 0,
        author,
        category,
        tags,
        commentCount: commentCountMap.get(article._id.toString()) || 0,
      }
    })

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error.message },
      { status: 500 }
    )
  }
}
