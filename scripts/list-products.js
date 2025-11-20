import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function listAllProducts() {
  try {
    console.log('📋 Listing all products in database...')
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`Found ${products.length} products:`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - €${product.price} (${product.category})`)
    })

    if (products.length === 0) {
      console.log('❌ No products found in database')
    }

  } catch (error) {
    console.error('❌ Error listing products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllProducts()