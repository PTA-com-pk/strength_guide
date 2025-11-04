import mongoose, { Schema, Model } from 'mongoose'

export interface IMedia {
  _id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  data?: Buffer // Binary image data stored in database
  alt?: string
  caption?: string
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    data: { type: Buffer }, // Store binary image data
    alt: { type: String },
    caption: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
)

MediaSchema.index({ filename: 1 })
MediaSchema.index({ mimeType: 1 })
MediaSchema.index({ createdAt: -1 })

const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)

export default Media

