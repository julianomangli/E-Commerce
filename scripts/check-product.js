import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkProductDetails() {
  try {
    console.log('🔍 Checking Son Goku T-shirt details...')
    
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Son Goku'
        }
      },
      include: {
        variants: true,
        images: true
      }
    })

    if (!product) {
      console.log('❌ Product not found')
      return
    }

    console.log('\n📊 Product Details:')
    console.log(`Name: ${product.name}`)
    console.log(`Price: €${product.price}`)
    console.log(`Category: ${product.category}`)
    
    console.log('\n🎨 Variants:')
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant, index) => {
        console.log(`${index + 1}. Type: ${variant.type}, Value: ${variant.value}, Hex: ${variant.hex}`)
      })
    } else {
      console.log('No variants found')
    }

    console.log('\n🖼️ Images:')
    if (product.images && product.images.length > 0) {
      product.images.forEach((image, index) => {
        console.log(`${index + 1}. URL: ${image.url || image.imageUrl}`)
      })
    } else {
      console.log('No images found')
    }

    console.log('\n📋 Raw Product Data:')
    console.log(JSON.stringify(product, null, 2))

  } catch (error) {
    console.error('❌ Error checking product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductDetails()