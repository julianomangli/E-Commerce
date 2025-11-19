// Force clear demo products and add real Printful products
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🗑️ Force clearing all demo products...')
    
    // Delete ALL existing products
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Deleted ${deletedProducts.count} products`)
    
    // Add your real Son Goku T-shirt
    const sonGokuProduct = await prisma.product.create({
      data: {
        name: "KAMEHA Son Goku T-Shirt | Black",
        description: "High-quality Son Goku T-shirt with professional Dragon Ball Z design. Premium cotton blend for comfort and durability. Available in multiple sizes.",
        price: 24.99,
        images: [
          "/printful-images/product_403512376_variant_5067477215_main.png"
        ],
        category: "Apparel",
        subcategory: "T-Shirts", 
        inStock: true,
        featured: true,
        printfulId: "403512376",
        sku: "KAMEHA-GOKU-BLACK-TSH",
        yourTotalProfit: 10.00
      }
    })
    
    // Add a few more placeholder products to populate the store
    const additionalProducts = [
      {
        name: "Dragon Ball Z Vegeta T-Shirt",
        description: "Coming soon - Premium Vegeta design T-shirt",
        price: 26.99,
        images: ["/api/placeholder/400/400"],
        category: "Apparel",
        subcategory: "T-Shirts",
        inStock: false,
        featured: false,
        sku: "VEGETA-TSH-001",
        yourTotalProfit: 12.00
      },
      {
        name: "Anime Collection Hoodie",
        description: "Coming soon - Premium anime hoodie collection",
        price: 49.99,
        images: ["/api/placeholder/400/400"],
        category: "Apparel", 
        subcategory: "Hoodies",
        inStock: false,
        featured: false,
        sku: "ANIME-HOODIE-001",
        yourTotalProfit: 20.00
      }
    ]
    
    for (const product of additionalProducts) {
      await prisma.product.create({ data: product })
    }
    
    console.log('✅ Added Son Goku T-shirt and placeholder products')
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared all demo products and added real Printful products`,
      mainProduct: sonGokuProduct,
      totalProducts: additionalProducts.length + 1
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