import { NextRequest, NextResponse } from 'next/server'
import { searchAmazonProducts } from '@/lib/amazon-associates'
import { isAmazonConfigured } from '@/lib/amazon-associates'

export async function GET(request: NextRequest) {
  try {
    // Check if Amazon API is configured
    if (!isAmazonConfigured()) {
      return NextResponse.json(
        {
          error: 'Amazon Associates API is not configured. Please set AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_PARTNER_TAG in your environment variables.',
        },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const keywords = searchParams.get('keywords')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const itemCount = searchParams.get('itemCount')

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      )
    }

    const result = await searchAmazonProducts({
      keywords,
      category: category || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      itemCount: itemCount ? parseInt(itemCount) : 10,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to search Amazon products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      items: result.items,
      totalResults: result.totalResults,
    })
  } catch (error: any) {
    console.error('Error searching Amazon products:', error)
    return NextResponse.json(
      { error: 'Failed to search Amazon products', details: error.message },
      { status: 500 }
    )
  }
}

