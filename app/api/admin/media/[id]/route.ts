import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import mongoose from 'mongoose'
import { unlink } from 'fs/promises'
import { join } from 'path'

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
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 })
    }

    const body = await request.json()
    const { alt, caption } = body

    const updateData: any = {}
    if (alt !== undefined) updateData.alt = alt
    if (caption !== undefined) updateData.caption = caption

    const media = await Media.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'uploadedBy',
        select: 'name email',
        strictPopulate: false,
      })
      .lean()

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({
      media: {
        ...media,
        _id: media._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media', details: error.message },
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
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 })
    }

    const media = await Media.findById(params.id).lean()

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete file from filesystem (if it exists as fallback)
    try {
      // Only try to delete if path doesn't start with /api/media (meaning it's in public folder)
      if (media.path && !media.path.startsWith('/api/media')) {
        const filepath = join(process.cwd(), 'public', media.path)
        await unlink(filepath)
      }
    } catch (fileError: any) {
      // File might not exist, continue with database deletion
      console.warn('Could not delete file:', fileError.message)
    }

    // Delete from database (this will also delete the binary data)
    await Media.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}

