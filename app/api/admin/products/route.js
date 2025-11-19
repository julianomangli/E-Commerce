import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, price, printfulId, images, variants } = body

    // Create new product with current schema
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageSrc: images?.[0] || 'https://via.placeholder.com/300',
        imageAlt: name,
        category: 'Custom',
        inStock: true,
        isActive: true,
        stockCount: 100,
      }
    })

    // Add additional images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: images[i],
            altText: `${name} image ${i + 1}`,
            order: i
          }
        })
      }
      
      // Update the main product imageSrc to the first uploaded image
      if (images[0]) {
        await prisma.product.update({
          where: { id: product.id },
          data: { imageSrc: images[0] }
        })
      }
    }

    // Add variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            type: 'size',
            value: variant.size || 'Regular',
            inStock: true
          }
        })
        
        if (variant.color) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              type: 'color',
              value: variant.color,
              inStock: true
            }
          })
        }
      }
    }

    // Fetch created product with relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: true,
        variants: true,
      }
    })

    return NextResponse.json({
      success: true,
      product: productWithRelations
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // Check if Prisma is initialized
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection failed', products: [] },
        { status: 500 }
      )
    }

    // Get all products for admin view with current schema
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform products to match expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images?.length > 0 ? 
        product.images.map(img => ({ url: img.imageUrl, alt: img.altText })) : 
        [{ url: product.imageSrc, alt: product.imageAlt }],
      variants: product.variants || [],
      category: product.category,
      inStock: product.inStock,
      createdAt: product.createdAt,
      // Ensure imageSrc is set to first image for backwards compatibility
      imageSrc: product.images?.[0]?.imageUrl || product.imageSrc
    }))

    return NextResponse.json({
      success: true,
      products: transformedProducts
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message, products: [] },
      { status: 500 }
    )
  }
}