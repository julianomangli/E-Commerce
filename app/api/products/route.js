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

    // If no products found, return fallback data
    if (products.length === 0) {
      console.log('⚠️ No products in database, returning fallback data')
      return NextResponse.json([
        {
          id: '1',
          name: 'Professional Laptop Backpack',
          price: 79.99,
          imageSrc: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
          imageAlt: 'Professional laptop backpack',
          colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'Navy', hex: '#1e40af' },
            { name: 'Gray', hex: '#6b7280' }
          ],
          sizes: [],
          category: 'Accessories',
          description: 'A durable and stylish laptop backpack perfect for professionals.',
          inStock: true,
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
            'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=500'
          ]
        }
      ])
    }

    // Transform data to match your existing format
    const transformedProducts = products.map(product => {
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
    
    // Return fallback products on error
    console.log('🔄 Returning fallback products due to error')
    return NextResponse.json([
      {
        id: '1',
        name: 'Professional Laptop Backpack',
        price: 79.99,
        imageSrc: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        imageAlt: 'Professional laptop backpack',
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'Navy', hex: '#1e40af' },
          { name: 'Gray', hex: '#6b7280' }
        ],
        sizes: [],
        category: 'Accessories',
        description: 'A durable and stylish laptop backpack perfect for professionals.',
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
          'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=500'
        ]
      },
      {
        id: '2',
        name: 'Wireless Headphones',
        price: 199.99,
        imageSrc: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        imageAlt: 'Wireless headphones',
        colors: [
          { name: 'Black', hex: '#000000' },
          { name: 'White', hex: '#ffffff' }
        ],
        sizes: [],
        category: 'Electronics',
        description: 'High-quality wireless headphones with noise cancellation.',
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        ]
      },
      {
        id: '3',
        name: 'Coffee Mug Set',
        price: 34.99,
        imageSrc: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500',
        imageAlt: 'Ceramic coffee mug set',
        colors: [
          { name: 'White', hex: '#ffffff' },
          { name: 'Blue', hex: '#3b82f6' }
        ],
        sizes: [],
        category: 'Home',
        description: 'Beautiful ceramic coffee mug set for your morning routine.',
        inStock: true,
        images: [
          'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500'
        ]
      }
    ])
  }
}