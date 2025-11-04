import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CalculatorResult from '@/models/CalculatorResult'
import mongoose from 'mongoose'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return request.ip || '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { calculatorType, inputs, results } = body

    if (!calculatorType || !inputs || !results) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user ID from request body (sent from client)
    // Client sends userId if user is logged in (from localStorage)
    const userId = body.userId || null

    // Generate session ID for anonymous users
    let sessionId: string | undefined
    if (!userId) {
      // Try to get existing session ID from cookies
      const existingSessionId = request.cookies.get('calculator_session_id')?.value
      if (existingSessionId) {
        sessionId = existingSessionId
      } else {
        // Generate new session ID
        sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`
      }
    }

    // Get IP and user agent
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || undefined

    // Create calculator result
    const calculatorResult = await CalculatorResult.create({
      calculatorType,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      sessionId,
      inputs,
      results,
      ipAddress,
      userAgent,
    })

    // Set session cookie for anonymous users
    const response = NextResponse.json(
      {
        success: true,
        id: calculatorResult._id,
        sessionId: calculatorResult.sessionId,
      },
      { status: 201 }
    )

    if (!userId && sessionId) {
      response.cookies.set('calculator_session_id', sessionId, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
        sameSite: 'lax',
        httpOnly: false, // Need to access client-side
      })
    }

    return response
  } catch (error: any) {
    console.error('Error saving calculator result:', error)
    return NextResponse.json(
      { error: 'Failed to save calculator result', details: error.message },
      { status: 500 }
    )
  }
}

