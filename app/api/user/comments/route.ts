import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Comment from '@/models/Comment'
import Article from '@/models/Article'
import mongoose from 'mongoose'
import '@/models/Comment'
import '@/models/Article'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Convert userId string to ObjectId for query
    const userObjectId = new mongoose.Types.ObjectId(userId)
    
    const comments = await Comment.find({ userId: userObjectId })
      .populate('articleId', 'title slug')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      comments: comments.map((c: any) => ({
        _id: c._id.toString(),
        content: c.content,
        article: c.articleId ? {
          _id: c.articleId._id?.toString() || '',
          title: c.articleId.title || '',
          slug: c.articleId.slug || '',
        } : null,
        createdAt: c.createdAt,
        approved: c.approved,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching user comments:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    )
  }
}

