// Add Son Goku T-shirt to database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSonGokuTshirt() {
  try {
    console.log('👕 Adding Son Goku T-shirt...')
    
    const product = await prisma.product.create({
      data: {
        printfulId: "403512376",
        name: "KAMEHA Son Goku T-Shirt | Black",
        description: "High-quality Son Goku T-shirt with professional Dragon Ball Z design. Premium cotton blend for comfort and durability.",
        price: 24.99,
        images: ["/printful-images/product_403512376_variant_5067477215_main.png"],
        category: "Apparel",
        subcategory: "T-Shirts",
        inStock: true,
        featured: true,
        yourTotalProfit: 10.00,
        sku: "KAMEHA-GOKU-BLACK",
        variants: [
          { size: "S", color: "Black", price: "24.99", stock: 100 },
          { size: "M", color: "Black", price: "24.99", stock: 100 },
          { size: "L", color: "Black", price: "24.99", stock: 100 },
          { size: "XL", color: "Black", price: "24.99", stock: 100 },
          { size: "2XL", color: "Black", price: "26.99", stock: 100 },
          { size: "3XL", color: "Black", price: "28.99", stock: 100 }
        ]
      }
    })
    
    console.log('✅ Son Goku T-shirt added successfully!')
    console.log(`   ID: ${product.id}`)
    console.log(`   Name: ${product.name}`)
    console.log(`   Price: €${product.price}`)
    
  } catch (error) {
    console.error('❌ Error adding Son Goku T-shirt:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSonGokuTshirt()