import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { cookies } from 'next/headers'
import { z } from 'zod'

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    sku: z.string(),
    image: z.string().optional(),
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validated = orderSchema.parse(body)
    const userId = request.headers.get('x-user-id') // Optional

    // Get cart from cookies
    const cookieStore = cookies()
    const cartCookie = cookieStore.get('cart')
    
    if (!cartCookie) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    const cart = JSON.parse(cartCookie.value)

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )
    
    // Simple shipping calculation (can be improved)
    const shipping = subtotal > 50 ? 0 : 5.99 // Free shipping over $50
    const tax = subtotal * 0.08 // 8% tax (adjust based on location)
    const total = subtotal + shipping + tax

    // Create order
    const orderData: any = {
      userId: userId ? userId : undefined,
      items: validated.items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: validated.shippingAddress,
      paymentMethod: validated.paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    }

    const order = await Order.create(orderData)

    // Clear cart
    const response = NextResponse.json({
      order: {
        ...order.toObject(),
        _id: order._id.toString(),
      },
      message: 'Order created successfully',
    })
    
    response.cookies.delete('cart')

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    )
  }
}

