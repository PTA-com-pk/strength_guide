import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Comment from '@/models/Comment'
import mongoose from 'mongoose'
import { z } from 'zod'

const commentSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  content: z.string().min(1).max(1000),
})

// Legacy route handler for comments
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()

    const article = await Article.findOne({ slug: params.slug })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const comments = await Comment.find({
      articleId: article._id,
      approved: true,
    })
      .sort({ createdAt: -1 })
      .lean()

    // Format comments to match frontend expectations
    const formattedComments = comments.map((comment: any) => ({
      id: comment._id.toString(),
      name: comment.name,
      email: comment.email,
      content: comment.content,
      createdAt: comment.createdAt,
    }))

    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()

    const body = await request.json()
    const validated = commentSchema.parse(body)
    const userId = request.headers.get('x-user-id')

    const article = await Article.findOne({ slug: params.slug })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const commentData: any = {
      ...validated,
      articleId: article._id,
      // Auto-approve comments from authenticated users, require moderation for anonymous
      approved: !!userId,
    }

    if (userId) {
      try {
        commentData.userId = new mongoose.Types.ObjectId(userId)
      } catch (error) {
        console.error('Invalid userId format:', userId)
      }
    }

    const comment = await Comment.create(commentData)

    // Format response to match frontend expectations
    const formattedComment = {
      id: comment._id.toString(),
      name: comment.name,
      email: comment.email,
      content: comment.content,
      createdAt: comment.createdAt,
      approved: comment.approved,
    }

    return NextResponse.json({ 
      comment: formattedComment,
      message: comment.approved 
        ? 'Comment posted successfully!' 
        : 'Comment submitted! It will appear after moderation.'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

