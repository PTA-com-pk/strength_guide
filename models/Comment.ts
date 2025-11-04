import mongoose, { Schema, Model, Types } from 'mongoose'

export interface IComment {
  _id: string
  name: string
  email: string
  content: string
  approved: boolean
  createdAt: Date
  updatedAt: Date
  articleId: Types.ObjectId
  userId?: Types.ObjectId
}

const CommentSchema = new Schema<IComment>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    approved: { type: Boolean, default: false },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
)

CommentSchema.index({ articleId: 1 })
CommentSchema.index({ approved: 1 })

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)

export default Comment

