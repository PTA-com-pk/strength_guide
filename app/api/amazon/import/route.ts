import { NextRequest, NextResponse } from 'next/server'
import { getAmazonProductByASIN, generateAffiliateLink } from '@/lib/amazon-associates'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { z } from 'zod'

const importProductSchema = z.object({
  asin: z.string().min(10).max(10),
  category: z.enum(['supplements', 'equipment', 'apparel', 'accessories']),
  slug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validatedData = importProductSchema.parse(body)

    // Fetch product details from Amazon
    const amazonResult = await getAmazonProductByASIN(validatedData.asin)

    if (!amazonResult.success || !amazonResult.item) {
      return NextResponse.json(
        { error: amazonResult.error || 'Failed to fetch product from Amazon' },
        { status: 400 }
      )
    }

    const amazonProduct = amazonResult.item

    // Generate slug if not provided
    const slug =
      validatedData.slug ||
      amazonProduct.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    // Check if product already exists
    const existingProduct = await Product.findOne({
      $or: [{ slug }, { amazonASIN: validatedData.asin }],
    })

    if (existingProduct) {
      return NextResponse.json(
        {
          error: 'Product already exists',
          product: {
            ...existingProduct.toObject(),
            _id: existingProduct._id.toString(),
          },
        },
        { status: 409 }
      )
    }

    // Generate affiliate link
    const affiliateLink = generateAffiliateLink(
      validatedData.asin,
      process.env.AMAZON_REGION || 'us'
    )

    // Create product
    const product = await Product.create({
      name: amazonProduct.title,
      slug,
      description: amazonProduct.description || amazonProduct.title,
      shortDescription: amazonProduct.description?.substring(0, 200) || '',
      price: amazonProduct.price / 100, // Amazon returns price in cents
      sku: `AMZ-${validatedData.asin}`,
      images: amazonProduct.images.large
        ? [amazonProduct.images.large]
        : [],
      category: validatedData.category,
      tags: validatedData.tags || [],
      inStock: amazonProduct.availability.toLowerCase().includes('stock'),
      productType: 'affiliate',
      affiliateLink,
      amazonASIN: validatedData.asin,
      amazonRegion: process.env.AMAZON_REGION || 'us',
      commissionRate: 4.0, // Default commission rate (can be customized)
      vendor: 'Amazon',
      vendorProductId: validatedData.asin,
      featured: validatedData.featured || false,
      status: 'active',
    })

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product.toObject(),
          _id: product._id.toString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error importing Amazon product:', error)
    return NextResponse.json(
      { error: 'Failed to import product', details: error.message },
      { status: 500 }
    )
  }
}

