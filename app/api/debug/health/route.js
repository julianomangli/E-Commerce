import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    console.log('🔧 Database health check started')
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
    console.log('📋 Environment variables:', envCheck)
    
    // Test database connection
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if products table exists and has data
    const productCount = await prisma.product.count()
    console.log(`📊 Products in database: ${productCount}`)
    
    // Test basic query
    const firstProduct = await prisma.product.findFirst()
    console.log('🔍 First product:', firstProduct ? 'Found' : 'None')
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'healthy',
      environment: envCheck,
      database: {
        connected: true,
        productCount,
        hasProducts: productCount > 0
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      environment: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}