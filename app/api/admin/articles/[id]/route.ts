import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import '@/models/Media'
import mongoose from 'mongoose'

async function checkAdmin(request: NextRequest): Promise<{ authorized: boolean; userId?: string }> {
  // Try to get user ID from header first (for client-side requests)
  let userId = request.headers.get('x-user-id')
  
  // If not in header, try to get from cookie (for cross-tab access)
  if (!userId) {
    userId = request.cookies.get('auth_token')?.value || null
  }
  
  // Also try to get from user_data cookie
  if (!userId) {
    const userDataCookie = request.cookies.get('user_data')?.value
    if (userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie)
        userId = userData._id
      } catch {
        // Invalid JSON, continue
      }
    }
  }
  
  if (!userId) {
    return { authorized: false }
  }
  
  try {
    await connectDB()
    const User = (await import('@/models/User')).default
    const user = await User.findById(userId).lean()
    return {
      authorized: user?.role === 'admin',
      userId: userId,
    }
  } catch {
    return { authorized: false }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    const article = await Article.findById(params.id)
      .populate('authorId', 'name email')
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
      .populate({
        path: 'heroImageId',
        select: 'filename url alt',
        strictPopulate: false,
      })
      .populate({
        path: 'proofreadBy',
        select: 'name email',
        strictPopulate: false,
      })
      .lean()

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({
      article: {
        ...article,
        _id: article._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      heroImage,
      heroImageId,
      categoryId,
      authorId,
      tagIds,
      publishedAt,
      proofread,
      proofreadAt,
      proofreadBy,
    } = body

    // Check if slug is being changed and if it conflicts
    const existingArticle = await Article.findById(params.id)
    if (existingArticle && slug && slug !== existingArticle.slug) {
      const slugConflict = await Article.findOne({ slug, _id: { $ne: params.id } })
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Article with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update article
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (content !== undefined) updateData.content = content
    if (heroImage !== undefined) updateData.heroImage = heroImage
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (authorId !== undefined) updateData.authorId = authorId
    if (tagIds !== undefined) updateData.tagIds = tagIds
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null
    }
    if (proofread !== undefined) updateData.proofread = proofread
    if (proofreadAt !== undefined) {
      updateData.proofreadAt = proofreadAt ? new Date(proofreadAt) : null
    }
    if (proofreadBy !== undefined) updateData.proofreadBy = proofreadBy || null

    const article = await Article.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('authorId', 'name email')
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
      .populate({
        path: 'heroImageId',
        select: 'filename url alt',
        strictPopulate: false,
      })
      .populate({
        path: 'proofreadBy',
        select: 'name email',
        strictPopulate: false,
      })
      .lean()

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({
      article: {
        ...article,
        _id: article._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 })
    }

    const article = await Article.findByIdAndDelete(params.id)

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}

