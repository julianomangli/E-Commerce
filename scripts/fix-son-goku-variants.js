import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixSonGokuVariants() {
  try {
    console.log('🔧 Fixing Son Goku T-shirt color variants...')
    
    // Find the Son Goku product
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Son Goku'
        }
      },
      include: {
        variants: true
      }
    })

    if (!product) {
      console.log('❌ Son Goku product not found')
      return
    }

    console.log(`Found product: ${product.name}`)
    console.log(`Current variants: ${product.variants.length}`)

    // Delete all existing color variants (keep only sizes)
    const deletedColorVariants = await prisma.productVariant.deleteMany({
      where: {
        productId: product.id,
        type: 'color'
      }
    })

    console.log(`🗑️ Deleted ${deletedColorVariants.count} color variants`)

    // Create only ONE black color variant
    const newColorVariant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        type: 'color',
        value: 'Black',
        hex: '#000000',
        inStock: true
      }
    })

    console.log(`✅ Created single color variant: ${newColorVariant.value}`)

    // Verify the final result
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        variants: true
      }
    })

    const colorVariants = updatedProduct.variants.filter(v => v.type === 'color')
    const sizeVariants = updatedProduct.variants.filter(v => v.type === 'size')

    console.log('\n📊 Final variant summary:')
    console.log(`Color variants: ${colorVariants.length} (${colorVariants.map(v => v.value).join(', ')})`)
    console.log(`Size variants: ${sizeVariants.length} (${sizeVariants.map(v => v.value).join(', ')})`)

    console.log('\n🎉 Son Goku T-shirt variants fixed!')

  } catch (error) {
    console.error('❌ Error fixing variants:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSonGokuVariants()