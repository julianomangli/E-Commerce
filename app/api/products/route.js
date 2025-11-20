import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Starting products API request...')
    console.log('🗄️ Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
    
    // Test database connection first
    console.log('⚙️ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    console.log('📦 Fetching products from database...')
    
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      where: {
        inStock: true
      }
    })

    console.log(`✅ Found ${products.length} products in database`)

    // If no products found, return empty array instead of demo products
    if (products.length === 0) {
      console.log('⚠️ No products in database')
      return NextResponse.json([])
    }

    // Transform data to match your existing format
    const transformedProducts = products.map(product => {
      // Get unique colors only (no duplicates)
      const allColors = product.variants
        .filter(v => v.type === 'color')
        .map(v => ({ name: v.value, hex: v.hex }))
      
      const colors = allColors.filter((color, index, self) => 
        index === self.findIndex(c => c.name === color.name && c.hex === color.hex)
      )
      
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

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageSrc: product.imageSrc, // Keep for backward compatibility
        imageAlt: product.imageAlt,
        images: productImages, // New array of all images
        category: product.category,
        colors,
        sizes,
        rating: Math.round(averageRating),
        inStock: product.inStock
      }
    })

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('❌ ERROR in products API:')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Database URL set:', process.env.DATABASE_URL ? 'YES' : 'NO')
    console.error('Node environment:', process.env.NODE_ENV)
    
    // Return empty array on error instead of demo products
    console.log('🔄 Returning empty products array due to error')
    return NextResponse.json([])
  }
}