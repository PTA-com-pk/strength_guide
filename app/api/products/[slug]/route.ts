import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()

    const product = await Product.findOne({
      slug: params.slug,
      status: 'active',
    }).lean()

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products (same category, exclude current)
    const relatedProducts = await Product.find({
      category: product.category,
      status: 'active',
      inStock: true,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select('name slug price images')
      .lean()

    return NextResponse.json({
      product: {
        ...product,
        _id: product._id.toString(),
      },
      relatedProducts: relatedProducts.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    )
  }
}

