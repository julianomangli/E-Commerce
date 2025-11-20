import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function nuclearDeleteDemoProducts() {
  try {
    console.log('💥 NUCLEAR DELETE - Eliminating ALL demo products forever...')
    
    // Delete ALL products except Son Goku
    const deleteResult = await prisma.product.deleteMany({
      where: {
        NOT: {
          name: {
            contains: 'Son Goku'
          }
        }
      }
    })

    console.log(`💀 DELETED ${deleteResult.count} non-Goku products`)

    console.log('💥 Cleanup complete!')

    // Verify only Son Goku remains
    const remainingProducts = await prisma.product.findMany({
      include: {
        variants: true
      }
    })

    console.log('\n🎯 REMAINING PRODUCTS:')
    remainingProducts.forEach(product => {
      const colorVariants = product.variants.filter(v => v.type === 'color')
      const sizeVariants = product.variants.filter(v => v.type === 'size')
      console.log(`✅ ${product.name}`)
      console.log(`   Colors: ${colorVariants.length} (${colorVariants.map(v => v.value).join(', ')})`)
      console.log(`   Sizes: ${sizeVariants.length} (${sizeVariants.map(v => v.value).join(', ')})`)
    })

    if (remainingProducts.length === 1 && remainingProducts[0].name.includes('Son Goku')) {
      console.log('\n🎉 SUCCESS! Only Son Goku remains!')
    } else {
      console.log('\n❌ WARNING: Unexpected products found!')
    }

  } catch (error) {
    console.error('💥 Nuclear delete failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

nuclearDeleteDemoProducts()