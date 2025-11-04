import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Article from '@/models/Article'
import '@/models/Article'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findById(userId).lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const history = user.readingHistory || []
    
    // Get article details
    const articleIds = history.map((h: any) => h.articleId)
    const articles = await Article.find({ _id: { $in: articleIds } })
      .populate('authorId', 'name avatar')
      .populate('categoryId', 'name slug')
      .lean()

    const historyWithArticles = history
      .map((h: any) => {
        const article = articles.find((a: any) => a._id.toString() === h.articleId.toString())
        return article ? { ...h, article } : null
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())

    return NextResponse.json({
      history: historyWithArticles,
    })
  } catch (error: any) {
    console.error('Error fetching reading history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reading history' },
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

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.readingHistory) {
      user.readingHistory = []
    }

    // Remove existing entry if any
    user.readingHistory = user.readingHistory.filter(
      (h: any) => h.articleId.toString() !== articleId
    )

    // Add new entry at the beginning
    user.readingHistory.unshift({
      articleId,
      viewedAt: new Date(),
    })

    // Keep only last 50 entries
    if (user.readingHistory.length > 50) {
      user.readingHistory = user.readingHistory.slice(0, 50)
    }

    await user.save()
    return NextResponse.json({ message: 'Reading history updated' })
  } catch (error: any) {
    console.error('Error updating reading history:', error)
    return NextResponse.json(
      { error: 'Failed to update reading history' },
      { status: 500 }
    )
  }
}

