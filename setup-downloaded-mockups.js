import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function addDownloadedMockups() {
  try {
    console.log('🖼️  Adding your downloaded mockup images...')

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

    // For now, I'll create placeholders that you can update with your actual image URLs
    // You can either:
    // 1. Upload these to /public/mockups/ folder
    // 2. Upload to a CDN and replace these URLs
    // 3. Wait for Printful to generate them and use the API

    const mockupImages = [
      {
        imageUrl: '/mockups/goku-front.png', // Upload your front view here
        altText: `${product.name} - Front View`,
        order: 0
      },
      {
        imageUrl: '/mockups/goku-back.png', // Upload your back view here
        altText: `${product.name} - Back View`,
        order: 1
      },
      {
        imageUrl: '/mockups/goku-side.png', // Upload your side view here
        altText: `${product.name} - Side View`,
        order: 2
      },
      {
        imageUrl: '/mockups/goku-detail.png', // Upload your detail view here
        altText: `${product.name} - Detail View`,
        order: 3
      }
    ]

    console.log('📸 Creating multiple mockup views:')
    mockupImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.altText} -> ${img.imageUrl}`)
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

    console.log(`✅ Added ${mockupImages.length} mockup views!`)
    console.log('\n📁 Next steps:')
    console.log('1. Create folder: public/mockups/')
    console.log('2. Add your downloaded images:')
    console.log('   - goku-front.png (front view)')
    console.log('   - goku-back.png (back view)')
    console.log('   - goku-side.png (side view)')
    console.log('   - goku-detail.png (detail view)')
    console.log('3. Or update the URLs above to point to your CDN')

  } catch (error) {
    console.error('❌ Error updating images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addDownloadedMockups()