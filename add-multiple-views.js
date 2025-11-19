import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function addMultipleMockupViews() {
  try {
    console.log('🖼️  Adding multiple mockup views manually...')

    // Get the KAMEHA t-shirt from database
    const product = await prisma.product.findFirst({
      where: { 
        sku: '691e1d24d573f8' 
      }
    })

    if (!product) {
      console.log('❌ Product not found!')
      return
    }

    console.log(`📦 Found product: ${product.name}`)

    // Delete existing images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    })

    // Create multiple mockup views using your downloaded images
    // You'll need to upload these to a CDN or use them from Printful when available
    const mockupImages = [
      {
        imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
        altText: `${product.name} - Front View`,
        order: 0
      },
      // Add more views as they become available from Printful
      // For now, we'll use the current mockup and you can replace these URLs
      // with the actual CDN URLs of your downloaded mockups
      {
        imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png', 
        altText: `${product.name} - Back View`,
        order: 1
      },
      {
        imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
        altText: `${product.name} - Side View`,
        order: 2
      },
      {
        imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
        altText: `${product.name} - Detail View`,
        order: 3
      }
    ]

    console.log('📸 Creating image entries:')
    mockupImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.altText}`)
    })

    // Add new images
    await prisma.productImage.createMany({
      data: mockupImages.map(img => ({
        productId: product.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        order: img.order
      }))
    })

    // Update main product image
    await prisma.product.update({
      where: { id: product.id },
      data: {
        imageSrc: mockupImages[0].imageUrl,
        imageAlt: mockupImages[0].altText
      }
    })

    console.log(`✅ Updated with ${mockupImages.length} mockup views!`)
    console.log('💡 To get more views:')
    console.log('   1. In Printful, go to your product')
    console.log('   2. Generate more mockup templates (back, side views)')
    console.log('   3. Run this script again to fetch new images')

  } catch (error) {
    console.error('❌ Error updating images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMultipleMockupViews()