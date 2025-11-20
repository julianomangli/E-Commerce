import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function permanentlyDeleteDemoProducts() {
  try {
    console.log('🗑️ Permanently deleting all demo products...')
    
    // List of demo products to delete
    const demoProductNames = [
      'Professional Laptop Backpack',
      'Wireless Headphones',
      'Coffee Mug Set',
      'Minimalist Ceramic Coffee Mug Set',
      'Wireless Noise-Canceling Headphones',
      'Wireless Noise-Cancelling Headphones'
    ]

    // Find all demo products
    const demoProducts = await prisma.product.findMany({
      where: {
        OR: demoProductNames.map(name => ({ name: { contains: name } }))
      },
      select: {
        id: true,
        name: true
      }
    })

    if (demoProducts.length === 0) {
      console.log('✅ No demo products found to delete')
      return
    }

    console.log(`Found ${demoProducts.length} demo products to delete:`)
    demoProducts.forEach(product => {
      console.log(`  - ${product.name}`)
    })

    const productIds = demoProducts.map(p => p.id)

    // Delete related data
    const deletedImages = await prisma.productImage.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`🖼️ Deleted ${deletedImages.count} product images`)

    const deletedVariants = await prisma.productVariant.deleteMany({
      where: { productId: { in: productIds } }
    })
    console.log(`🔧 Deleted ${deletedVariants.count} product variants`)

    // Delete the products
    const deletedProducts = await prisma.product.deleteMany({
      where: { id: { in: productIds } }
    })
    console.log(`🗑️ Deleted ${deletedProducts.count} demo products`)

    // Verify only real products remain
    const remainingProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      }
    })

    console.log('\n📋 Remaining products:')
    if (remainingProducts.length === 0) {
      console.log('❌ No products remaining!')
    } else {
      remainingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - €${product.price} (${product.category})`)
      })
    }

    console.log('\n🎉 Demo products permanently deleted!')

  } catch (error) {
    console.error('❌ Error deleting demo products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

permanentlyDeleteDemoProducts()