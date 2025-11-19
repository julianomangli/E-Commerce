import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables (Vercel will handle these automatically)
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
}

const prisma = new PrismaClient()

async function setupVercelDatabase() {
  try {
    console.log('🚀 Setting up database for Vercel deployment...')

    // Check if this is a fresh database
    const existingProducts = await prisma.product.findMany()
    
    if (existingProducts.length === 0) {
      console.log('📦 Fresh database detected - setting up initial data...')
      
      // Create the Printful product
      const product = await prisma.product.create({
        data: {
          name: 'KAMEHA Son Goku T-Shirt | Black',
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

⚡ **Express your inner Saiyan power with this amazing KAMEHA design!**`,
          price: 20.99,
          imageSrc: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
          imageAlt: 'KAMEHA Son Goku T-Shirt | Black - Front View',
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
          isFeatured: true,
          viewCount: 0,
          saleCount: 0
        }
      })

      console.log('✅ Product created:', product.name)

      // Add size variants
      const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL']
      for (const size of sizes) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            type: 'size',
            value: size,
            hex: null,
            inStock: true
          }
        })
      }

      console.log(`✅ Added ${sizes.length} size variants`)

      // Add product images
      const images = [
        {
          imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
          altText: 'KAMEHA Son Goku T-Shirt | Black - Front View',
          order: 0
        },
        {
          imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
          altText: 'KAMEHA Son Goku T-Shirt | Black - Back View',
          order: 1
        },
        {
          imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
          altText: 'KAMEHA Son Goku T-Shirt | Black - Side View',
          order: 2
        },
        {
          imageUrl: 'https://files.cdn.printful.com/files/c3d/c3dd8ad66ffde39abfc643219c5fe827_preview.png',
          altText: 'KAMEHA Son Goku T-Shirt | Black - Comparison View',
          order: 3
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

      console.log(`✅ Added ${images.length} product images`)
      
    } else {
      console.log('📊 Database already contains products - skipping setup')
      console.log(`Found ${existingProducts.length} existing products`)
    }

    console.log('🎉 Vercel database setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupVercelDatabase()
}

export { setupVercelDatabase }