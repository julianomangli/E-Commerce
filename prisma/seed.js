import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: "Basic Tee",
    description: "Ultra-soft cotton tee in classic colors",
    price: 24.00,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg",
    imageAlt: "Basic tee in black, white, and navy",
    category: "clothing",
    variants: [
      { type: "color", value: "black", hex: "#000000" },
      { type: "color", value: "white", hex: "#FFFFFF" },
      { type: "color", value: "navy", hex: "#1E3A8A" },
      { type: "size", value: "S" },
      { type: "size", value: "M" },
      { type: "size", value: "L" },
      { type: "size", value: "XL" },
    ]
  },
  {
    name: "Graphic Tee",
    description: "Stylish graphic tee with modern design",
    price: 29.00,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg",
    imageAlt: "Graphic tee in various colors",
    category: "clothing",
    variants: [
      { type: "color", value: "white", hex: "#FFFFFF" },
      { type: "color", value: "gray", hex: "#6B7280" },
      { type: "color", value: "black", hex: "#000000" },
      { type: "size", value: "S" },
      { type: "size", value: "M" },
      { type: "size", value: "L" },
    ]
  },
  {
    name: "Premium Hoodie",
    description: "Comfortable premium hoodie with modern fit",
    price: 59.00,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg",
    imageAlt: "Premium hoodie in gray",
    category: "clothing",
    variants: [
      { type: "color", value: "gray", hex: "#6B7280" },
      { type: "color", value: "charcoal", hex: "#374151" },
      { type: "color", value: "black", hex: "#000000" },
      { type: "size", value: "M" },
      { type: "size", value: "L" },
      { type: "size", value: "XL" },
    ]
  },
  {
    name: "Zip Hoodie",
    description: "Full-zip hoodie for layering",
    price: 64.00,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg",
    imageAlt: "Zip hoodie in multiple colors",
    category: "clothing",
    variants: [
      { type: "color", value: "black", hex: "#000000" },
      { type: "color", value: "olive", hex: "#65A30D" },
      { type: "color", value: "white", hex: "#FFFFFF" },
      { type: "size", value: "S" },
      { type: "size", value: "M" },
      { type: "size", value: "L" },
      { type: "size", value: "XL" },
    ]
  },
  {
    name: "Lightweight Jacket",
    description: "Perfect for transitional weather",
    price: 89.00,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-01.jpg",
    imageAlt: "Lightweight jacket in black",
    category: "outerwear",
    variants: [
      { type: "color", value: "black", hex: "#000000" },
      { type: "color", value: "khaki", hex: "#A16207" },
      { type: "size", value: "M" },
      { type: "size", value: "L" },
      { type: "size", value: "XL" },
    ]
  },
  {
    name: "Everyday Cap",
    description: "Classic cap for everyday wear",
    price: 19.00,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-04.jpg",
    imageAlt: "Baseball cap in various colors",
    category: "accessories",
    variants: [
      { type: "color", value: "black", hex: "#000000" },
      { type: "color", value: "navy", hex: "#1E3A8A" },
      { type: "color", value: "white", hex: "#FFFFFF" },
    ]
  }
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create products with variants
  for (const productData of sampleProducts) {
    const { variants, ...product } = productData
    
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        variants: {
          create: variants
        }
      },
      include: {
        variants: true
      }
    })
    
    console.log(`✅ Created product: ${createdProduct.name} with ${createdProduct.variants.length} variants`)
  }

  // Create a sample user
  const sampleUser = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+30 123 456 7890'
    }
  })
  
  console.log(`✅ Created sample user: ${sampleUser.email}`)

  // Create a sample address
  await prisma.address.create({
    data: {
      userId: sampleUser.id,
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      city: 'Athens',
      region: 'Attica',
      postalCode: '10115',
      country: 'Greece',
      isDefault: true
    }
  })

  console.log('✅ Created sample address')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })