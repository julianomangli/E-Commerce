import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { productNames } = await request.json()
    
    if (!productNames || !Array.isArray(productNames)) {
      return NextResponse.json(
        { error: 'Product names array is required' },
        { status: 400 }
      )
    }

    // Delete products by name
    const deleteResult = await prisma.product.deleteMany({
      where: {
        name: {
          in: productNames
        }
      }
    })

    // Also delete any related variants and images
    await prisma.productVariant.deleteMany({
      where: {
        product: {
          name: {
            in: productNames
          }
        }
      }
    })

    await prisma.productImage.deleteMany({
      where: {
        product: {
          name: {
            in: productNames
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Successfully deleted ${deleteResult.count} products`,
      deletedProducts: productNames
    })
  } catch (error) {
    console.error('Error deleting specific products:', error)
    return NextResponse.json(
      { error: 'Failed to delete products', details: error.message },
      { status: 500 }
    )
  }
}