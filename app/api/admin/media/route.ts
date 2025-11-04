import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

async function checkAdmin(request: NextRequest): Promise<{ authorized: boolean; userId?: string }> {
  let userId = request.headers.get('x-user-id')
  
  if (!userId) {
    userId = request.cookies.get('auth_token')?.value || null
  }
  
  if (!userId) {
    const userDataCookie = request.cookies.get('user_data')?.value
    if (userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie)
        userId = userData._id
      } catch {
        // Invalid JSON
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all' // all, image, document, etc.

    const skip = (page - 1) * limit

    const query: any = {}

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } },
      ]
    }

    if (type === 'image') {
      query.mimeType = { $regex: '^image/', $options: 'i' }
    } else if (type === 'document') {
      query.mimeType = { $regex: '^(application|text)/', $options: 'i' }
    }

    const [media, total] = await Promise.all([
      Media.find(query)
        .populate({
          path: 'uploadedBy',
          select: 'name email',
          strictPopulate: false,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(query),
    ])

    return NextResponse.json({
      media: media.map((item: any) => ({
        ...item,
        _id: item._id.toString(),
        uploadedBy: item.uploadedBy ? {
          _id: item.uploadedBy._id.toString(),
          name: item.uploadedBy.name,
          email: item.uploadedBy.email,
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
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const alt = formData.get('alt') as string | null
    const caption = formData.get('caption') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomStr}.${extension}`

    // Read file data into buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create media record with binary data stored in database
    const media = await Media.create({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `/api/media/${filename}`, // API route for serving
      url: `/api/media/${filename}`, // API route for serving
      data: buffer, // Store binary data in database
      alt: alt || file.name,
      caption: caption || null,
      uploadedBy: auth.userId,
    })

    const populated = await Media.findById(media._id)
      .populate({
        path: 'uploadedBy',
        select: 'name email',
        strictPopulate: false,
      })
      .lean()

    return NextResponse.json({
      media: {
        ...populated,
        _id: populated!._id.toString(),
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media', details: error.message },
      { status: 500 }
    )
  }
}

