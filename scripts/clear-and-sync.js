// Clear demo products and sync real Printful products
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAndSyncProducts() {
  try {
    console.log('🗑️ Clearing demo products...')
    
    // Delete all existing products
    await prisma.product.deleteMany({})
    console.log('✅ Demo products cleared')
    
    console.log('🔄 Syncing real Printful products...')
    
    // Import and run the Printful sync
    const { syncAllProductsWithImages } = await import('./sync-printful-with-images.js')
    await syncAllProductsWithImages()
    
    console.log('✅ Real Printful products synced!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAndSyncProducts()
  .then(() => {
    console.log('🎉 Database updated with real products!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })