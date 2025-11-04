import mongoose, { Schema, Model } from 'mongoose'

export interface IUser {
  _id: string
  email: string
  name?: string
  password: string
  role: 'user' | 'admin'
  avatar?: string
  bio?: string
  favoriteArticles?: mongoose.Types.ObjectId[]
  readingHistory?: Array<{
    articleId: mongoose.Types.ObjectId
    viewedAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    bio: { type: String },
    favoriteArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    readingHistory: [
      {
        articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

