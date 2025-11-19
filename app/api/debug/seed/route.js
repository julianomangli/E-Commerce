import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST() {
  try {
    console.log('🌱 Starting manual database seeding...')
    
    // Check if products already exist
    const existingProducts = await prisma.product.count()
    
    if (existingProducts > 0) {
      console.log(`ℹ️ Database already has ${existingProducts} products`)
      return NextResponse.json({ 
        message: 'Database already seeded',
        productCount: existingProducts 
      })
    }
    
    console.log('📦 Creating featured products...')
    
    // Create the 3 featured products
    const products = [
      {
        name: 'Professional Laptop Backpack',
        description: 'A durable and stylish laptop backpack perfect for professionals on the go.',
        price: 79.99,
        category: 'Accessories',
        inStock: true,
        featured: true,
        variants: {
          create: [
            { color: 'Black', size: 'One Size', sku: 'LB-BLACK-OS' },
            { color: 'Navy', size: 'One Size', sku: 'LB-NAVY-OS' },
            { color: 'Gray', size: 'One Size', sku: 'LB-GRAY-OS' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', alt: 'Professional laptop backpack', order: 1 },
            { url: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=500', alt: 'Laptop backpack side view', order: 2 }
          ]
        }
      },
      {
        name: 'Wireless Headphones',
        description: 'Premium wireless headphones with noise cancellation and superior sound quality.',
        price: 199.99,
        category: 'Electronics',
        inStock: true,
        featured: true,
        variants: {
          create: [
            { color: 'Black', size: 'One Size', sku: 'WH-BLACK-OS' },
            { color: 'White', size: 'One Size', sku: 'WH-WHITE-OS' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Wireless headphones', order: 1 }
          ]
        }
      },
      {
        name: 'Coffee Mug Set',
        description: 'Beautiful ceramic coffee mug set perfect for your morning routine.',
        price: 34.99,
        category: 'Home',
        inStock: true,
        featured: true,
        variants: {
          create: [
            { color: 'White', size: 'Standard', sku: 'CM-WHITE-STD' },
            { color: 'Blue', size: 'Standard', sku: 'CM-BLUE-STD' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', alt: 'Ceramic coffee mug set', order: 1 }
          ]
        }
      }
    ]
    
    for (const productData of products) {
      await prisma.product.create({
        data: productData
      })
    }
    
    const finalCount = await prisma.product.count()
    console.log(`✅ Successfully seeded ${finalCount} products`)
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      productCount: finalCount 
    })
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 })
  }
}