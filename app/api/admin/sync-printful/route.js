import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client with error handling
let prisma;
try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
}

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

export async function POST(request) {
  try {
    console.log('🔄 Starting Printful product sync...')

    // Fetch products from Printful
    const printfulResponse = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!printfulResponse.ok) {
      throw new Error(`Printful API error: ${printfulResponse.status}`)
    }

    const printfulData = await printfulResponse.json()
    console.log(`📦 Found ${printfulData.result.length} products in Printful`)

    let syncedProducts = 0
    let errors = []

    for (const printfulProduct of printfulData.result) {
      try {
        // Get detailed product info
        const detailResponse = await fetch(`https://api.printful.com/store/products/${printfulProduct.id}`, {
          headers: {
            'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        const detailData = await detailResponse.json()
        const product = detailData.result.sync_product
        const variants = detailData.result.sync_variants

        // Check if product exists
        const existingProduct = await prisma.product.findFirst({
          where: { 
            OR: [
              { sku: product.id.toString() },
              { name: product.name }
            ]
          }
        })

        if (existingProduct) {
          // Update existing product with Euro pricing
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: product.name,
              description: product.name,
              price: variants[0]?.retail_price ? parseFloat(variants[0].retail_price) * 0.85 + 10 : 29.99, // Convert USD to EUR approximation + €10 profit
              imageSrc: product.thumbnail_url || existingProduct.imageSrc,
              imageAlt: product.name,
            }
          })

          console.log(`✅ Updated existing product: ${product.name}`)
        } else {
          // Create new product with current schema and Euro pricing
          const newProduct = await prisma.product.create({
            data: {
              name: product.name,
              description: product.name,
              price: variants[0]?.retail_price ? parseFloat(variants[0].retail_price) * 0.85 + 10 : 29.99, // Convert USD to EUR + €10 profit
              imageSrc: product.thumbnail_url || 'https://via.placeholder.com/300',
              imageAlt: product.name,
              category: 'T-Shirts',
              subcategory: 'Printful',
              brand: 'KAMEHA',
              sku: product.id.toString(),
              inStock: true,
              isActive: true,
              stockCount: 100,
            }
          })

          // Add variants with current schema
          for (const variant of variants) {
            if (variant.size) {
              await prisma.productVariant.create({
                data: {
                  productId: newProduct.id,
                  type: 'size',
                  value: variant.size,
                  inStock: true
                }
              })
            }
            if (variant.color) {
              await prisma.productVariant.create({
                data: {
                  productId: newProduct.id,
                  type: 'color',
                  value: variant.color,
                  inStock: true
                }
              })
            }
          }

          console.log(`🆕 Created new product: ${product.name}`)
        }

        syncedProducts++
      } catch (productError) {
        console.error(`❌ Error syncing product ${printfulProduct.name}:`, productError)
        errors.push(`${printfulProduct.name}: ${productError.message}`)
      }
    }

    console.log(`🎉 Sync completed! ${syncedProducts} products synced`)

    return NextResponse.json({
      success: true,
      syncedProducts,
      totalProducts: printfulData.result.length,
      errors
    })

  } catch (error) {
    console.error('❌ Sync failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  }
}