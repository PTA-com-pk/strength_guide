import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Article from '@/models/Article'
import Comment from '@/models/Comment'
import mongoose from 'mongoose'
import '@/models/Article'
import '@/models/Comment'
import { ArticleListItem } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findById(userId).populate('favoriteArticles').lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const favoriteArticleIds = user.favoriteArticles || []
    
    if (favoriteArticleIds.length === 0) {
      return NextResponse.json({ favorites: [] })
    }

    // Get full article details
    const articles = await Article.find({ _id: { $in: favoriteArticleIds } })
      .populate('authorId', 'name avatar')
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
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

    // Format articles to ArticleListItem
    const formattedFavorites: ArticleListItem[] = articles.map((article: any) => {
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

    return NextResponse.json({
      favorites: formattedFavorites,
    })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { articleId } = await request.json()
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    // Verify article exists and convert articleId to ObjectId
    let articleObjectId: mongoose.Types.ObjectId
    try {
      articleObjectId = new mongoose.Types.ObjectId(articleId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid article ID format' },
        { status: 400 }
      )
    }

    const article = await Article.findById(articleObjectId)
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Initialize favoriteArticles if it doesn't exist
    if (!user.favoriteArticles) {
      user.favoriteArticles = []
    }

    // Check if already favorited (convert both to strings for comparison)
    const favoriteIds = user.favoriteArticles.map((id: any) => id.toString())
    const isFavorited = favoriteIds.includes(articleId)

    if (isFavorited) {
      // Remove from favorites
      user.favoriteArticles = user.favoriteArticles.filter(
        (id: any) => id.toString() !== articleId
      )
      await user.save()
      return NextResponse.json({ message: 'Removed from favorites', favorited: false })
    } else {
      // Add to favorites (use ObjectId)
      user.favoriteArticles.push(articleObjectId)
      await user.save()
      return NextResponse.json({ message: 'Added to favorites', favorited: true })
    }
  } catch (error: any) {
    console.error('Error updating favorites:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to update favorites', details: error.message },
      { status: 500 }
    )
  }
}

