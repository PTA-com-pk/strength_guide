import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'

async function checkAdmin(request: NextRequest): Promise<boolean> {
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
  
  if (!userId) return false
  
  try {
    await connectDB()
    const User = (await import('@/models/User')).default
    const user = await User.findById(userId).lean()
    return user?.role === 'admin'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdmin(request)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const authors = await Author.find().sort({ name: 1 }).lean()

    return NextResponse.json({
      authors: authors.map((author: any) => ({
        ...author,
        _id: author._id.toString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

