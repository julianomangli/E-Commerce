// API endpoint to clear demo products and sync real Printful products
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🗑️ Clearing demo products from production...')
    
    // Delete all existing demo products
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        OR: [
          { name: { contains: "Professional Laptop Backpack" } },
          { name: { contains: "Wireless Noise-Canceling Headphones" } },
          { name: { contains: "Minimalist Ceramic Coffee Mug" } },
          { sku: { in: ["BACKPACK-001", "HEADPHONES-001", "MUG-SET-001"] } }
        ]
      }
    })
    
    console.log(`✅ Deleted ${deletedProducts.count} demo products`)
    
    // Add the real Son Goku T-shirt
    const sonGokuProduct = await prisma.product.create({
      data: {
        printfulId: "403512376",
        name: "KAMEHA Son Goku T-Shirt | Black",
        description: "High-quality Son Goku T-shirt with professional Dragon Ball Z design. Premium cotton blend for comfort and durability.",
        price: 24.99,
        images: ["/printful-images/product_403512376_variant_5067477215_main.png"],
        category: "Apparel",
        subcategory: "T-Shirts",
        inStock: true,
        featured: true,
        yourTotalProfit: 10.00,
        sku: "KAMEHA-GOKU-BLACK",
        variants: [
          { size: "S", color: "Black", price: "24.99", stock: 100 },
          { size: "M", color: "Black", price: "24.99", stock: 100 },
          { size: "L", color: "Black", price: "24.99", stock: 100 },
          { size: "XL", color: "Black", price: "24.99", stock: 100 },
          { size: "2XL", color: "Black", price: "26.99", stock: 100 },
          { size: "3XL", color: "Black", price: "28.99", stock: 100 }
        ]
      }
    })
    
    console.log('✅ Added Son Goku T-shirt to production')
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${deletedProducts.count} demo products and added Son Goku T-shirt`,
      product: sonGokuProduct
    })
    
  } catch (error) {
    console.error('❌ Error updating products:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update products' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}