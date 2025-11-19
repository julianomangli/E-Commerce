import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Clean up invalid cart items
export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get all cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId }
    })

    let deletedCount = 0
    
    // Check each cart item and delete if product doesn't exist or quantity is invalid
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      // Delete if product doesn't exist or quantity is invalid
      if (!product || item.quantity <= 0) {
        await prisma.cartItem.delete({
          where: { id: item.id }
        })
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} invalid cart items`,
      deletedCount
    })
  } catch (error) {
    console.error('Error cleaning cart:', error)
    return NextResponse.json(
      { error: 'Failed to clean cart', details: error.message },
      { status: 500 }
    )
  }
}