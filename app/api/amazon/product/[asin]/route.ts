import { NextRequest, NextResponse } from 'next/server'
import { getAmazonProductByASIN } from '@/lib/amazon-associates'
import { isAmazonConfigured } from '@/lib/amazon-associates'

export async function GET(
  request: NextRequest,
  { params }: { params: { asin: string } }
) {
  try {
    if (!isAmazonConfigured()) {
      return NextResponse.json(
        {
          error: 'Amazon Associates API is not configured',
        },
        { status: 500 }
      )
    }

    const result = await getAmazonProductByASIN(params.asin)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product: result.item,
    })
  } catch (error: any) {
    console.error('Error fetching Amazon product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    )
  }
}

