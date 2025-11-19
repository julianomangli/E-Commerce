import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Transform data to match your existing format
    const colors = product.variants
      .filter(v => v.type === 'color')
      .map(v => ({ name: v.value, hex: v.hex }))
    
    const sizes = product.variants
      .filter(v => v.type === 'size')
      .map(v => v.value)

    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

    // Get all product images, fallback to main imageSrc if no images
    const productImages = product.images.length > 0 
      ? product.images.map(img => ({ url: img.imageUrl, alt: img.altText }))
      : [{ url: product.imageSrc, alt: product.imageAlt }]

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price, // Return as number, not formatted string
      imageSrc: product.imageSrc,
      imageAlt: product.imageAlt,
      images: productImages, // New array of all images
      category: product.category,
      colors,
      sizes,
      rating: Math.round(averageRating),
      inStock: product.inStock,
      reviews: product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
        user: review.user
      }))
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}