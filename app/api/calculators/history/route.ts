import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CalculatorResult from '@/models/CalculatorResult'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') // Sent from client if logged in
    const calculatorType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query: any = {}

    if (userId) {
      // Logged-in user: get their results
      query.userId = new mongoose.Types.ObjectId(userId)
    } else {
      // Anonymous user: get by session ID
      const sessionId = request.cookies.get('calculator_session_id')?.value
      if (sessionId) {
        query.sessionId = sessionId
      } else {
        // No session ID, return empty
        return NextResponse.json({ results: [] })
      }
    }

    if (calculatorType) {
      query.calculatorType = calculatorType
    }

    const results = await CalculatorResult.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Error fetching calculator history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calculator history', details: error.message },
      { status: 500 }
    )
  }
}

