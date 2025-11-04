import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Article from '@/models/Article'
import { CategoryWithCount } from '@/lib/types'

export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find().sort({ name: 1 }).lean()

    // Get article counts for each category
    const articleCounts = await Article.aggregate([
      { $match: { publishedAt: { $ne: null } } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ])

    const countMap = new Map(
      articleCounts.map((c: any) => [c._id.toString(), c.count])
    )

    const categoriesWithCount: CategoryWithCount[] = categories.map(
      (category: any) => ({
        ...category,
        _id: category._id.toString(),
        articleCount: countMap.get(category._id.toString()) || 0,
      })
    )

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
