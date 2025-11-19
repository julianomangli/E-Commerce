import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const featuredProducts = [
  {
    name: "Professional Laptop Backpack",
    description: "Premium water-resistant laptop backpack with multiple compartments for work and travel. Features padded laptop sleeve, organization pockets, and comfortable shoulder straps.",
    price: 89.99,
    imageSrc: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center",
    imageAlt: "Professional laptop backpack in charcoal gray",
    category: "accessories",
    subcategory: "bags",
    brand: "TechCarry",
    sku: "TC-LB-001",
    stockCount: 25,
    isFeatured: true,
    variants: [
      { type: "color", value: "charcoal", hex: "#36454F" },
      { type: "color", value: "navy", hex: "#1E3A8A" },
      { type: "color", value: "black", hex: "#000000" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center",
        altText: "Professional laptop backpack main view",
        order: 0
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&h=800&fit=crop&crop=center",
        altText: "Laptop backpack interior compartments",
        order: 1
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop&crop=center",
        altText: "Backpack side pocket detail",
        order: 2
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=left",
        altText: "Professional backpack worn",
        order: 3
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop&crop=right",
        altText: "Backpack zipper and handle detail",
        order: 4
      }
    ]
  },
  {
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and superior audio quality. Perfect for work, travel, and entertainment.",
    price: 249.99,
    imageSrc: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&crop=center",
    imageAlt: "Wireless noise-canceling headphones in black",
    category: "electronics",
    subcategory: "audio",
    brand: "SoundPro",
    sku: "SP-WH-001",
    stockCount: 15,
    isFeatured: true,
    variants: [
      { type: "color", value: "black", hex: "#000000" },
      { type: "color", value: "white", hex: "#FFFFFF" },
      { type: "color", value: "silver", hex: "#C0C0C0" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&crop=center",
        altText: "Wireless headphones main view",
        order: 0
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&crop=center",
        altText: "Headphones on desk setup",
        order: 1
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop&crop=center",
        altText: "Headphones detail shot",
        order: 2
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&crop=center",
        altText: "Headphones worn by person",
        order: 3
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=800&h=800&fit=crop&crop=center",
        altText: "Headphones charging case",
        order: 4
      }
    ]
  },
  {
    name: "Minimalist Ceramic Coffee Mug Set",
    description: "Elegant set of 4 handcrafted ceramic mugs with modern minimalist design. Perfect for coffee, tea, and hot beverages. Dishwasher and microwave safe.",
    price: 45.99,
    imageSrc: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=800&fit=crop&crop=center",
    imageAlt: "Minimalist ceramic coffee mug set",
    category: "home",
    subcategory: "kitchen",
    brand: "CeramicCraft",
    sku: "CC-MUG-SET-001",
    stockCount: 30,
    isFeatured: true,
    variants: [
      { type: "color", value: "white", hex: "#FFFFFF" },
      { type: "color", value: "sage", hex: "#9CAF88" },
      { type: "color", value: "charcoal", hex: "#36454F" },
      { type: "size", value: "12oz" },
      { type: "size", value: "16oz" }
    ],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=800&fit=crop&crop=center",
        altText: "Ceramic mug set on wooden table",
        order: 0
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?w=800&h=800&fit=crop&crop=center",
        altText: "Single mug with coffee",
        order: 1
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=800&fit=crop&crop=center",
        altText: "Mug set arranged beautifully",
        order: 2
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=800&h=800&fit=crop&crop=center",
        altText: "Mug being held with warm drink",
        order: 3
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=800&h=800&fit=crop&crop=center",
        altText: "Mug set packaging and details",
        order: 4
      }
    ]
  }
]

async function addFeaturedProducts() {
  console.log('🌟 Adding featured products with multiple images...')

  for (const productData of featuredProducts) {
    const { variants, images, ...product } = productData
    
    try {
      const createdProduct = await prisma.product.create({
        data: {
          ...product,
          variants: {
            create: variants
          },
          images: {
            create: images
          }
        },
        include: {
          variants: true,
          images: true
        }
      })
      
      console.log(`✅ Created product: ${createdProduct.name}`)
      console.log(`   - ${createdProduct.variants.length} variants`)
      console.log(`   - ${createdProduct.images.length} images`)
      console.log(`   - SKU: ${createdProduct.sku}`)
      console.log('')
      
    } catch (error) {
      console.error(`❌ Error creating product ${product.name}:`, error.message)
    }
  }

  console.log('🎉 Featured products added successfully!')
}

addFeaturedProducts()
  .catch((e) => {
    console.error('❌ Error during product creation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })