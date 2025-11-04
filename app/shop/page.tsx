import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Shop - Fitness Products & Supplements',
  description: 'Shop premium fitness supplements, workout equipment, and fitness gear. Free shipping on orders over $50.',
  openGraph: {
    title: 'Shop - Fitness Products & Supplements',
    description: 'Shop premium fitness supplements, workout equipment, and fitness gear.',
    url: `${baseUrl}/shop`,
    siteName: 'StrengthGuide',
  },
}

async function getProducts(category?: string, featured?: boolean) {
  try {
    await connectDB()
    
    const query: any = {
      status: 'active',
      inStock: true,
    }
    
    if (category) {
      query.category = category
    }
    
    if (featured) {
      query.featured = true
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
    
    return products.map((product: any) => ({
      ...product,
      _id: product._id.toString(),
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

const categories = [
  { name: 'All Products', slug: '', icon: '🏋️' },
  { name: 'Supplements', slug: 'supplements', icon: '💊' },
  { name: 'Equipment', slug: 'equipment', icon: '🏋️' },
  { name: 'Apparel', slug: 'apparel', icon: '👕' },
  { name: 'Accessories', slug: 'accessories', icon: '🎒' },
]

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const category = searchParams.category || ''
  const products = await getProducts(category || undefined)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            Fitness Shop
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Premium fitness supplements, workout equipment, and gear to help you achieve your goals.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug ? `/shop?category=${cat.slug}` : '/shop'}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  (!category && !cat.slug) || category === cat.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product._id}
                href={`/shop/${product.slug}`}
                className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-200"
              >
                {product.images && product.images.length > 0 && (
                  <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.compareAtPrice && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        SALE
                      </span>
                    )}
                    {product.productType === 'affiliate' && (
                      <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.243 15.533.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.113 8.738 14.546z"/>
                        </svg>
                        Amazon
                      </span>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-primary-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.shortDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.shortDescription}
                    </p>
                  )}
                  <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                    View Product
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

