import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IArticle {
  _id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  heroImage?: string
  heroImageId?: Types.ObjectId
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  views: number
  authorId: Types.ObjectId
  categoryId: Types.ObjectId
  tagIds: Types.ObjectId[]
  proofread?: boolean
  proofreadAt?: Date
  proofreadBy?: Types.ObjectId
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    heroImage: { type: String },
    publishedAt: { type: Date, index: true },
    views: { type: Number, default: 0, index: -1 },
    authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    tagIds: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    heroImageId: { type: Schema.Types.ObjectId, ref: 'Media' },
    proofread: { type: Boolean, default: false, index: true },
    proofreadAt: { type: Date },
    proofreadBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    strictPopulate: false, // Allow populating fields that may not exist in all documents
  }
)

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)

export default Article

