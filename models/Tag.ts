import mongoose, { Schema, Model } from 'mongoose'

export interface ITag {
  _id: string
  name: string
  slug: string
  createdAt: Date
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
)

const Tag: Model<ITag> = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema)

export default Tag

