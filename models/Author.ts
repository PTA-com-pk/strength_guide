import mongoose, { Schema, Model } from 'mongoose'

export interface IAuthor {
  _id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
    youtube?: string
  }
  createdAt: Date
  updatedAt: Date
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    bio: { type: String },
    socialLinks: {
      type: {
        twitter: String,
        instagram: String,
        facebook: String,
        youtube: String,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

const Author: Model<IAuthor> =
  mongoose.models.Author || mongoose.model<IAuthor>('Author', AuthorSchema)

export default Author

