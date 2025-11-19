import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, price, images } = body

    // Update product with current schema
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageSrc: images?.[0] || undefined,
        imageAlt: name,
      },
      include: {
        images: true,
        variants: true,
      }
    })

    // Handle additional images
    if (images && images.length > 0) {
      // Delete existing additional images
      await prisma.productImage.deleteMany({
        where: { productId: id }
      })

      // Add all images including the first one
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            imageUrl: images[i],
            altText: `${name} image ${i + 1}`,
            order: i
          }
        })
      }
      
      // Update main product image to first uploaded image
      await prisma.product.update({
        where: { id: id },
        data: { imageSrc: images[0] }
      })
    }

    // Fetch updated product with images
    const productWithImages = await prisma.product.findUnique({
      where: { id: id },
      include: {
        images: { orderBy: { order: 'asc' } },
        variants: true,
      }
    })

    return NextResponse.json({
      success: true,
      product: productWithImages
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    )
  }
}