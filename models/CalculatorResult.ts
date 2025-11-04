import mongoose, { Schema, Model } from 'mongoose'

export interface ICalculatorResult {
  _id: string
  calculatorType: string // e.g., 'bmr-calculator', 'tdee-calculator'
  userId?: mongoose.Types.ObjectId // Optional - for logged-in users
  sessionId?: string // For anonymous users
  inputs: Record<string, any> // Store all input values
  results: {
    value: number
    unit: string
    breakdown?: Array<{ label: string; value: number | string }>
    recommendations?: string[]
  }
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

const CalculatorResultSchema = new Schema<ICalculatorResult>(
  {
    calculatorType: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    inputs: { type: Schema.Types.Mixed, required: true },
    results: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
      breakdown: [
        {
          label: String,
          value: Schema.Types.Mixed,
        },
      ],
      recommendations: [String],
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
CalculatorResultSchema.index({ userId: 1, createdAt: -1 })
CalculatorResultSchema.index({ sessionId: 1, createdAt: -1 })
CalculatorResultSchema.index({ calculatorType: 1, createdAt: -1 })

const CalculatorResult: Model<ICalculatorResult> =
  mongoose.models.CalculatorResult ||
  mongoose.model<ICalculatorResult>('CalculatorResult', CalculatorResultSchema)

export default CalculatorResult

