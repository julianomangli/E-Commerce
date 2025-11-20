import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function deleteHeadphones() {
  try {
    console.log('🗑️ Deleting the remaining headphones product...')
    
    const productToDelete = 'Wireless Noise-Canceling Headphones'

    // First, find the product
    const product = await prisma.product.findFirst({
      where: {
        name: productToDelete
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!product) {
      console.log('❌ Headphones product not found')
      return
    }

    console.log('Found product to delete:', product)

    // Delete related data first
    const deletedImages = await prisma.productImage.deleteMany({
      where: {
        productId: product.id
      }
    })
    console.log(`🖼️ Deleted ${deletedImages.count} product images`)

    const deletedVariants = await prisma.productVariant.deleteMany({
      where: {
        productId: product.id
      }
    })
    console.log(`🔧 Deleted ${deletedVariants.count} product variants`)

    // Delete the product
    const deletedProduct = await prisma.product.delete({
      where: {
        id: product.id
      }
    })

    console.log(`✅ Successfully deleted product: ${deletedProduct.name}`)
    console.log('🎉 Cleanup completed!')

  } catch (error) {
    console.error('❌ Error deleting product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteHeadphones()