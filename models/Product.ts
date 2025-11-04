import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IProduct {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number // Original price for discounts
  sku: string
  images: string[]
  category: string // supplements, equipment, apparel, accessories
  tags: string[]
  inStock: boolean
  stockQuantity?: number
  weight?: number // For shipping calculations
  dimensions?: {
    length: number
    width: number
    height: number
  }
  vendor: string // Dropshipping supplier name
  vendorProductId?: string // External product ID
  // Affiliate product fields
  productType: 'regular' | 'affiliate' // Regular store product or affiliate link
  affiliateLink?: string // Amazon affiliate link or other affiliate URL
  amazonASIN?: string // Amazon Standard Identification Number
  amazonRegion?: string // us, uk, ca, etc.
  commissionRate?: number // Commission percentage
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    sku: { type: String, required: true, unique: true },
    images: [{ type: String }],
    category: { 
      type: String, 
      required: true,
      enum: ['supplements', 'equipment', 'apparel', 'accessories'],
      index: true
    },
    tags: [{ type: String }],
    inStock: { type: Boolean, default: true, index: true },
    stockQuantity: { type: Number },
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    vendor: { type: String, required: true },
    vendorProductId: { type: String },
    // Affiliate product fields
    productType: {
      type: String,
      enum: ['regular', 'affiliate'],
      default: 'regular',
      index: true,
    },
    affiliateLink: { type: String }, // Amazon affiliate link
    amazonASIN: { type: String, index: true }, // Amazon ASIN
    amazonRegion: { type: String, default: 'us' }, // us, uk, ca, etc.
    commissionRate: { type: Number }, // Commission percentage
    status: { 
      type: String, 
      enum: ['active', 'draft', 'archived'], 
      default: 'active',
      index: true
    },
    featured: { type: Boolean, default: false, index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
ProductSchema.index({ category: 1, status: 1 })
ProductSchema.index({ featured: 1, status: 1 })
ProductSchema.index({ inStock: 1, status: 1 })

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product

