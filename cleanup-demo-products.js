import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function cleanupDemoProducts() {
  try {
    console.log('🗑️  Starting cleanup of demo products...')

    // Get all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        brand: true
      }
    })

    console.log('📦 Found products:')
    allProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.category}/${product.brand}) - SKU: ${product.sku}`)
    })

    // Filter out Printful products (keep only products with brand: 'Printful' or category: 'printful')
    const demoProducts = allProducts.filter(product => 
      product.brand !== 'Printful' && 
      product.category !== 'printful'
    )

    const printfulProducts = allProducts.filter(product => 
      product.brand === 'Printful' || 
      product.category === 'printful'
    )

    console.log(`\n🎯 Keeping ${printfulProducts.length} Printful products:`)
    printfulProducts.forEach(product => {
      console.log(`  ✅ ${product.name}`)
    })

    console.log(`\n🗑️  Removing ${demoProducts.length} demo products:`)
    demoProducts.forEach(product => {
      console.log(`  ❌ ${product.name}`)
    })

    if (demoProducts.length === 0) {
      console.log('✅ No demo products to remove!')
      return
    }

    // Delete related data first (foreign key constraints)
    for (const product of demoProducts) {
      console.log(`🧹 Cleaning up data for: ${product.name}`)
      
      // Delete product variants
      const deletedVariants = await prisma.productVariant.deleteMany({
        where: { productId: product.id }
      })
      console.log(`  - Deleted ${deletedVariants.count} variants`)

      // Delete product images
      const deletedImages = await prisma.productImage.deleteMany({
        where: { productId: product.id }
      })
      console.log(`  - Deleted ${deletedImages.count} images`)

      // Delete reviews
      const deletedReviews = await prisma.review.deleteMany({
        where: { productId: product.id }
      })
      console.log(`  - Deleted ${deletedReviews.count} reviews`)

      // Delete cart items
      const deletedCartItems = await prisma.cartItem.deleteMany({
        where: { productId: product.id }
      })
      console.log(`  - Deleted ${deletedCartItems.count} cart items`)

      // Delete the product itself
      await prisma.product.delete({
        where: { id: product.id }
      })
      console.log(`  ✅ Deleted product: ${product.name}`)
    }

    console.log('\n🎉 Cleanup complete!')
    console.log('💫 Your store now only contains Printful products!')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDemoProducts()