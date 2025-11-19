import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function setupMultipleMockups() {
  try {
    console.log('🎨 Setting up multiple mockup views for Son Goku T-Shirt...')

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

    // Use the current Printful image as the main view
    // You can replace these URLs once you upload your downloaded mockups
    const currentPrintfulImage = 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png'
    
    const mockupImages = [
      {
        imageUrl: currentPrintfulImage,
        altText: `${product.name} - Front View`,
        order: 0
      },
      {
        imageUrl: currentPrintfulImage, // Replace with your back view URL
        altText: `${product.name} - Back View`,
        order: 1
      },
      {
        imageUrl: currentPrintfulImage, // Replace with your side view URL
        altText: `${product.name} - Side View`,
        order: 2
      },
      {
        imageUrl: currentPrintfulImage, // Replace with your detail view URL
        altText: `${product.name} - Comparison View`,
        order: 3
      }
    ]

    console.log('🖼️  Creating image carousel with multiple views:')
    mockupImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.altText}`)
    })

    // Add new images to database
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
    console.log('\n🎯 Your product now has an image carousel!')
    console.log('📱 Customers can swipe through multiple views')
    
    console.log('\n💡 To use your downloaded images:')
    console.log('1. Upload them to a CDN (Cloudinary, AWS S3, etc.)')
    console.log('2. Or put them in public/mockups/ folder')
    console.log('3. Update the database with new URLs')
    
  } catch (error) {
    console.error('❌ Error setting up mockups:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupMultipleMockups()