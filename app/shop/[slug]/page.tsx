import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import ProductClient from './client'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  await connectDB()
  const product = await Product.findOne({ slug: params.slug, status: 'active' }).lean()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - Shop`,
    description: product.seoDescription || product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  await connectDB()
  
  const product = await Product.findOne({
    slug: params.slug,
    status: 'active',
  }).lean()

  if (!product) {
    notFound()
  }

  // Get related products
  const relatedProducts = await Product.find({
    category: product.category,
    status: 'active',
    inStock: true,
    _id: { $ne: product._id },
  })
    .limit(4)
    .select('name slug price images')
    .lean()

  const productData = {
    ...product,
    _id: product._id.toString(),
  }

  const relatedData = relatedProducts.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
  }))

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-gray-600 hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/shop" className="text-gray-600 hover:text-primary-600">
            Shop
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="bg-white rounded-lg p-4">
            {product.images && product.images.length > 0 ? (
              <div className="relative w-full h-96 md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-2xl">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6 lg:p-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-black text-primary-600">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <ProductClient product={{
              ...productData,
              productType: (product as any).productType || 'regular',
              affiliateLink: (product as any).affiliateLink,
            }} />

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Product Details</h3>
              <dl className="space-y-2">
                <div className="flex">
                  <dt className="font-semibold text-gray-700 w-32">SKU:</dt>
                  <dd className="text-gray-600">{product.sku}</dd>
                </div>
                <div className="flex">
                  <dt className="font-semibold text-gray-700 w-32">Category:</dt>
                  <dd className="text-gray-600 capitalize">{product.category}</dd>
                </div>
                {product.stockQuantity !== undefined && (
                  <div className="flex">
                    <dt className="font-semibold text-gray-700 w-32">Stock:</dt>
                    <dd className="text-gray-600">{product.stockQuantity} available</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedData.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedData.map((related: any) => (
                <Link
                  key={related._id}
                  href={`/shop/${related.slug}`}
                  className="group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-200"
                >
                  {related.images && related.images.length > 0 && (
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                      <Image
                        src={related.images[0]}
                        alt={related.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {related.name}
                    </h3>
                    <p className="text-xl font-black text-primary-600">
                      ${related.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

