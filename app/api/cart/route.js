import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// Get cart items for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId }
    })

    // Get product details for each cart item
    const transformedItems = await Promise.all(cartItems.map(async item => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      return {
        id: item.id,
        quantity: item.quantity,
        colorName: item.colorName,
        size: item.size,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          imageSrc: product.imageSrc,
          imageAlt: product.imageAlt
        } : null
      }
    }))

    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// Add item to cart
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1, colorName, size } = body

    console.log('Cart POST request:', { userId, productId, quantity, colorName, size })

    if (!userId || !productId) {
      console.log('Missing required fields:', { userId, productId })
      return NextResponse.json({ error: 'User ID and Product ID required' }, { status: 400 })
    }

    // Convert productId to the correct format
    const productIdToUse = productId // Keep as string since database uses string IDs

    // Normalize the optional fields to handle null/undefined
    const normalizedColorName = colorName || null
    const normalizedSize = size || null

    // Check if item already exists in cart with exact same options
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: productIdToUse,
        colorName: normalizedColorName,
        size: normalizedSize
      }
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
      
      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: updatedItem.productId }
      })
      
      const result = {
        ...updatedItem,
        product
      }
      
      console.log('Updated existing cart item:', updatedItem.id)
      return NextResponse.json(result)
    } else {
      // Create new cart item
      const newItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: productIdToUse,
          quantity,
          colorName: normalizedColorName,
          size: normalizedSize
        }
      })
      
      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: newItem.productId }
      })
      
      const result = {
        ...newItem,
        product
      }
      
      console.log('Created new cart item:', newItem.id)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// Update cart item quantity
export async function PUT(request) {
  try {
    const { id, quantity } = await request.json()

    if (!id || quantity < 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: id } })
      return NextResponse.json({ message: 'Item removed from cart' })
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: id },
      data: { quantity }
    })
    
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: updatedItem.productId }
    })
    
    const result = {
      ...updatedItem,
      product
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

// Remove item from cart
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    await prisma.cartItem.delete({ where: { id: id } })
    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}