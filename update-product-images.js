import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

async function updateProductImages() {
  try {
    console.log('🖼️  Updating product images with full mockup set...')

    // Get the KAMEHA t-shirt from database
    const product = await prisma.product.findFirst({
      where: { 
        sku: '691e1d24d573f8' 
      },
      include: {
        images: true
      }
    })

    if (!product) {
      console.log('❌ Product not found!')
      return
    }

    console.log(`📦 Found product: ${product.name}`)
    console.log(`📷 Current images: ${product.images.length}`)

    // Get full product details from Printful API
    console.log('🔍 Fetching full mockup set from Printful...')
    const response = await fetch('https://api.printful.com/store/products/403512376', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ Failed to fetch from Printful API')
      return
    }

    const data = await response.json()
    const variants = data.result.sync_variants || []

    // Collect all mockup images from all variants
    const allImages = []
    const seenUrls = new Set()

    console.log(`🔍 Processing ${variants.length} variants...`)

    variants.forEach((variant, variantIndex) => {
      console.log(`  📋 Variant ${variantIndex + 1}: ${variant.name}`)
      if (variant.files) {
        console.log(`    📁 Found ${variant.files.length} files`)
        variant.files.forEach((file, fileIndex) => {
          console.log(`      📄 File ${fileIndex + 1}: ${file.type} - ${file.filename}`)
          
          // Include ALL preview type files (mockups)
          if (file.type === 'preview' && file.preview_url && !seenUrls.has(file.preview_url)) {
            seenUrls.add(file.preview_url)
            
            let altText = `${product.name}`
            let order = allImages.length
            
            // Determine view type from filename
            if (file.filename && file.filename.toLowerCase().includes('front')) {
              altText += ' - Front View'
              order = 0
            } else if (file.filename && file.filename.toLowerCase().includes('back')) {
              altText += ' - Back View'
              order = 1
            } else if (file.filename && file.filename.toLowerCase().includes('side')) {
              altText += ' - Side View'
              order = 2
            } else {
              altText += ` - View ${allImages.length + 1}`
              order = allImages.length
            }

            console.log(`      ✅ Adding image: ${altText}`)
            allImages.push({
              imageUrl: file.preview_url,
              altText: altText,
              order: order
            })
          }
        })
      }
    })

    // Sort by order to ensure proper sequence
    allImages.sort((a, b) => a.order - b.order)

    console.log(`🎨 Found ${allImages.length} unique mockup images`)
    
    // Print all images for verification
    allImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.altText}`)
      console.log(`     ${img.imageUrl}`)
    })

    // Delete existing images
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    })
    console.log('🗑️  Cleared old images')

    // Add new images
    await prisma.productImage.createMany({
      data: allImages.map(img => ({
        productId: product.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        order: img.order
      }))
    })

    // Update main product image and enhance description
    if (allImages.length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          imageSrc: allImages[0].imageUrl,
          imageAlt: allImages[0].altText,
          description: `Premium quality Dragon Ball Z inspired t-shirt featuring the iconic KAMEHA design with Son Goku. 

🔥 **Features:**
• High-quality Gildan 64000 Unisex Softstyle fabric
• Tear-away label for comfort
• Vibrant, long-lasting print
• Perfect fit for anime fans
• Professional screen printing

📏 **Available Sizes:** S, M, L, XL, 2XL, 3XL

🎯 **Perfect For:**
• Dragon Ball Z fans
• Anime enthusiasts  
• Casual everyday wear
• Gift for manga lovers

💪 **Quality Guarantee:** Premium materials and professional printing ensure this t-shirt will look great wash after wash.

⚡ **Express your inner Saiyan power with this amazing KAMEHA design!**`
        }
      })
    }

    console.log(`✅ Updated with ${allImages.length} high-quality mockup images!`)
    console.log('🎉 Your product now has professional mockup images!')

  } catch (error) {
    console.error('❌ Error updating images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductImages()