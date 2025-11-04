import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Cart is stored in cookies for simplicity
// For production, consider using a database or Redis

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get('cart')
    
    if (!cartCookie) {
      return NextResponse.json({ items: [], total: 0 })
    }

    const cart = JSON.parse(cartCookie.value)
    return NextResponse.json(cart)
  } catch (error) {
    return NextResponse.json({ items: [], total: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, price, quantity, sku, image } = body

    if (!productId || !name || !price || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const cartCookie = cookieStore.get('cart')
    
    interface CartItem {
      productId: string
      name: string
      price: number
      quantity: number
      sku: string
      image?: string
    }
    
    interface Cart {
      items: CartItem[]
      total: number
    }
    
    let cart: Cart = { items: [], total: 0 }
    
    if (cartCookie) {
      cart = JSON.parse(cartCookie.value) as Cart
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    )

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        productId,
        name,
        price,
        quantity,
        sku,
        image,
      })
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    // Set cookie (expires in 30 days)
    const response = NextResponse.json(cart)
    response.cookies.set('cart', JSON.stringify(cart), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const cartCookie = cookieStore.get('cart')
    
    interface CartItem {
      productId: string
      name: string
      price: number
      quantity: number
      sku: string
      image?: string
    }
    
    interface Cart {
      items: CartItem[]
      total: number
    }
    
    if (!cartCookie) {
      return NextResponse.json({ items: [], total: 0 })
    }

    let cart: Cart = JSON.parse(cartCookie.value) as Cart
    cart.items = cart.items.filter(
      (item: any) => item.productId !== productId
    )

    // Recalculate total
    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    const response = NextResponse.json(cart)
    response.cookies.set('cart', JSON.stringify(cart), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove item', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const cartCookie = cookieStore.get('cart')
    
    interface CartItem {
      productId: string
      name: string
      price: number
      quantity: number
      sku: string
      image?: string
    }
    
    interface Cart {
      items: CartItem[]
      total: number
    }
    
    if (!cartCookie) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    let cart: Cart = JSON.parse(cartCookie.value) as Cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    )

    if (itemIndex < 0) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1)
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity
    }

    // Recalculate total
    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    const response = NextResponse.json(cart)
    response.cookies.set('cart', JSON.stringify(cart), {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    )
  }
}

