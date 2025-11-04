import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Tag from '@/models/Tag'
import Article from '@/models/Article'

export async function GET() {
  try {
    await connectDB()

    const tags = await Tag.find().sort({ name: 1 }).lean()

    // Get article counts for each tag
    const articleCounts = await Article.aggregate([
      { $match: { publishedAt: { $ne: null } } },
      { $unwind: '$tagIds' },
      { $group: { _id: '$tagIds', count: { $sum: 1 } } },
    ])

    const countMap = new Map(
      articleCounts.map((c: any) => [c._id.toString(), c.count])
    )

    const tagsWithCount = tags.map((tag: any) => ({
      ...tag,
      _id: tag._id.toString(),
      articleCount: countMap.get(tag._id.toString()) || 0,
    }))

    return NextResponse.json({ tags: tagsWithCount })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
