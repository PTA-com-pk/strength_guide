import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    await connectDB()

    // Find media by filename
    const media = await Media.findOne({ filename: params.filename }).lean()

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // If no binary data stored, try to serve from public folder as fallback
    if (!media.data) {
      // Fallback to public folder
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      const { existsSync } = await import('fs')
      
      const publicPath = join(process.cwd(), 'public', media.path.replace('/api/media/', ''))
      
      if (existsSync(publicPath)) {
        const fileBuffer = await readFile(publicPath)
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': media.mimeType,
            'Content-Length': media.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
      
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    // Serve binary data from database
    // Convert Binary to Buffer for NextResponse
    const buffer = Buffer.from(media.data.buffer || media.data)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': media.mimeType,
        'Content-Length': media.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${media.originalName}"`,
      },
    })
  } catch (error: any) {
    console.error('Error serving media:', error)
    return NextResponse.json(
      { error: 'Failed to serve media' },
      { status: 500 }
    )
  }
}


