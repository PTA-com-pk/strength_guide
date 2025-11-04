import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
// Import all models to ensure they're registered
import '@/models/Author'
import '@/models/Category'
import '@/models/Tag'
import Article from '@/models/Article'
import Comment from '@/models/Comment'
import { ArticleListItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')

    const articles = await Article.find({
      publishedAt: { $ne: null },
    })
      .populate('authorId', 'name avatar')
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
      .sort({ views: -1 })
      .limit(limit)
      .lean()

    // Get comment counts
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

      return {
        _id: article._id.toString(),
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        heroImage: article.heroImage,
        publishedAt: article.publishedAt,
        views: article.views || 0,
        author,
        category,
        tags,
        commentCount: commentCountMap.get(article._id.toString()) || 0,
      }
    })

    return NextResponse.json({ articles: formattedArticles })
  } catch (error) {
    console.error('Error fetching popular articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular articles' },
      { status: 500 }
    )
  }
}
