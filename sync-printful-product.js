import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function syncPrintfulProduct() {
  try {
    console.log('🚀 Syncing KAMEHA Son Goku T-Shirt...')

    // Create the Printful product in our database
    const product = await prisma.product.create({
      data: {
        name: 'KAMEHA Son Goku T-Shirt | Black',
        description: 'High-quality Dragon Ball Z inspired t-shirt featuring Son Goku. Perfect for anime fans and Dragon Ball enthusiasts.',
        price: 20.99, // €18.25 + small markup
        imageSrc: 'https://files.cdn.printful.com/files/c7b/c7b0c15a3e615727541dd0ad15034229_preview.png',
        imageAlt: 'KAMEHA Son Goku T-Shirt | Black',
        category: 'printful',
        subcategory: 'apparel',
        brand: 'Printful',
        sku: '691e1d24d573f8',
        weight: 0.3,
        dimensions: '',
        tags: 'printful,anime,goku,dragon ball,t-shirt',
        inStock: true,
        stockCount: 999,
        isActive: true,
        isFeatured: true, // Make it featured so it appears prominently
        viewCount: 0,
        saleCount: 0
      }
    })

    console.log('✅ Product created with ID:', product.id)

    // Add size variants
    const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']
    const prices = [20.99, 20.99, 20.99, 20.99, 22.95, 24.99] // Based on Printful pricing

    for (let i = 0; i < sizes.length; i++) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          type: 'size',
          value: sizes[i],
          hex: null,
          inStock: true
        }
      })
    }

    console.log('✅ Added', sizes.length, 'size variants')

    // Add product images
    const images = [
      {
        imageUrl: 'https://files.cdn.printful.com/files/c7b/c7b0c15a3e615727541dd0ad15034229_preview.png',
        altText: 'KAMEHA Son Goku T-Shirt | Black - Front View',
        order: 0
      },
      {
        imageUrl: 'https://files.cdn.printful.com/files/4c8/4c8b98e57354e8711c404ef9b9e83652_preview.png',
        altText: 'Son Goku Design',
        order: 1
      }
    ]

    for (const image of images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: image.imageUrl,
          altText: image.altText,
          order: image.order
        }
      })
    }

    console.log('✅ Added', images.length, 'product images')
    console.log('🎉 Successfully synced KAMEHA Son Goku T-Shirt!')

  } catch (error) {
    console.error('❌ Error syncing product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncPrintfulProduct()