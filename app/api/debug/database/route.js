import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test database connection
    const prisma = new PrismaClient()
    
    // Try to count products
    const productCount = await prisma.product.count()
    console.log(`Found ${productCount} products in database`)
    
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      }
    })
    
    console.log('Products:', products)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      productCount,
      products,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}