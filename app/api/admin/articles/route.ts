import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'
import Author from '@/models/Author'
import Tag from '@/models/Tag'
import '@/models/Media'

// Helper to check admin auth
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

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || 'all'
    const proofread = searchParams.get('proofread') || 'all'

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ]
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        query.categoryId = categoryDoc._id
      }
    }

    if (status === 'published') {
      query.publishedAt = { $ne: null }
    } else if (status === 'draft') {
      query.publishedAt = null
    }

    if (proofread === 'completed') {
      query.proofread = true
    } else if (proofread === 'pending') {
      query.proofread = { $ne: true }
    }

    const [articles, total] = await Promise.all([
      Article.find(query)
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
          strictPopulate: false, // Allow populating even if field doesn't exist on all documents
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ])

    return NextResponse.json({
      articles: articles.map((article: any) => ({
        ...article,
        _id: article._id.toString(),
        authorId: article.authorId ? {
          _id: article.authorId._id.toString(),
          name: article.authorId.name,
          email: article.authorId.email,
        } : null,
        categoryId: article.categoryId ? {
          _id: article.categoryId._id.toString(),
          name: article.categoryId.name,
          slug: article.categoryId.slug,
        } : null,
        tagIds: article.tagIds?.map((tag: any) => ({
          _id: tag._id.toString(),
          name: tag.name,
          slug: tag.slug,
        })) || [],
        proofreadBy: article.proofreadBy ? {
          _id: article.proofreadBy._id.toString(),
          name: article.proofreadBy.name,
          email: article.proofreadBy.email,
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

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

    // Validation
    if (!title || !slug || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingArticle = await Article.findOne({ slug })
    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 400 }
      )
    }

    // Create article
    const article = await Article.create({
      title,
      slug,
      excerpt: excerpt || title.substring(0, 200),
      content,
      heroImage,
      heroImageId: heroImageId || null,
      categoryId,
      authorId,
      tagIds: tagIds || [],
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      views: 0,
      proofread: proofread || false,
      proofreadAt: proofreadAt ? new Date(proofreadAt) : null,
      proofreadBy: proofreadBy || null,
    })

    const populated = await Article.findById(article._id)
      .populate('authorId', 'name email')
      .populate('categoryId', 'name slug')
      .populate('tagIds', 'name slug')
      .populate({
        path: 'heroImageId',
        select: 'filename url alt',
        strictPopulate: false,
      })
      .lean()

    return NextResponse.json({
      article: {
        ...populated,
        _id: populated!._id.toString(),
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article', details: error.message },
      { status: 500 }
    )
  }
}

