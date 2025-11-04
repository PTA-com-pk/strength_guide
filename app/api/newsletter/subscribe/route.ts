import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// Simple in-memory store for newsletter subscriptions
// In production, you'd want to use a database or email service like Mailchimp, SendGrid, etc.
const subscriptions = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already subscribed (in production, check database)
    if (subscriptions.has(normalizedEmail)) {
      return NextResponse.json(
        { message: 'You are already subscribed!', alreadySubscribed: true },
        { status: 200 }
      )
    }

    // Add to subscriptions (in production, save to database)
    subscriptions.add(normalizedEmail)

    // In production, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email marketing service (Mailchimp, SendGrid, etc.)

    return NextResponse.json(
      { 
        message: 'Successfully subscribed! Check your email to confirm.',
        success: true 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return subscription count (for stats)
  return NextResponse.json({
    count: subscriptions.size,
  })
}


