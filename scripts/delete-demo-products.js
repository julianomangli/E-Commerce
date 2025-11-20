import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function deleteSpecificProducts() {
  try {
    console.log('🗑️ Starting to delete specific demo products...')
    
    const productsToDelete = [
      'Minimalist Ceramic Coffee Mug Set',
      'Wireless Noise-Cancelling Headphones',
      'Professional Laptop Backpack'
    ]

    console.log('Products to delete:', productsToDelete)

    // First, let's check what products exist
    const existingProducts = await prisma.product.findMany({
      where: {
        name: {
          in: productsToDelete
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log('Found products to delete:', existingProducts)

    if (existingProducts.length === 0) {
      console.log('❌ No matching products found in database')
      return
    }

    // Delete related data first to avoid foreign key constraints
    const productIds = existingProducts.map(p => p.id)

    // Delete product images
    const deletedImages = await prisma.productImage.deleteMany({
      where: {
        productId: {
          in: productIds
        }
      }
    })
    console.log(`🖼️ Deleted ${deletedImages.count} product images`)

    // Delete product variants
    const deletedVariants = await prisma.productVariant.deleteMany({
      where: {
        productId: {
          in: productIds
        }
      }
    })
    console.log(`🔧 Deleted ${deletedVariants.count} product variants`)

    // Delete the products themselves
    const deletedProducts = await prisma.product.deleteMany({
      where: {
        name: {
          in: productsToDelete
        }
      }
    })

    console.log(`✅ Successfully deleted ${deletedProducts.count} products:`)
    existingProducts.forEach(product => {
      console.log(`   - ${product.name}`)
    })

    console.log('🎉 Database cleanup completed!')

  } catch (error) {
    console.error('❌ Error deleting products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteSpecificProducts()