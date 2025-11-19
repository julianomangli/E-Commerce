// API endpoint for syncing Printful products with image downloads
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Printful API configuration
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY
const PRINTFUL_BASE_URL = 'https://api.printful.com'

// Download image from URL and save locally
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), 'public', 'printful-images', filename)
    
    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✅ Image already exists: ${filename}`)
      return resolve(`/printful-images/${filename}`)
    }

    const file = fs.createWriteStream(filePath)
    
    https.get(url, (response) => {
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log(`📥 Downloaded: ${filename}`)
        resolve(`/printful-images/${filename}`)
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // Delete partial file
      console.error(`❌ Error downloading ${filename}:`, err.message)
      reject(err)
    })
  })
}

// Get file extension from URL
function getFileExtension(url) {
  const urlPath = new URL(url).pathname
  const ext = path.extname(urlPath)
  return ext || '.jpg' // Default to .jpg if no extension
}

// Create safe filename from product info
function createSafeFilename(productId, variantId, imageIndex, url) {
  const ext = getFileExtension(url)
  return `product_${productId}_variant_${variantId}_${imageIndex}${ext}`
}

export async function POST() {
  try {
    console.log('🚀 Starting full Printful sync with images...')
    
    // Fetch products from Printful
    const response = await fetch(`${PRINTFUL_BASE_URL}/store/products`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status}`)
    }

    const data = await response.json()
    const products = data.result
    
    console.log(`📦 Found ${products.length} products`)
    
    // Process each product
    for (const product of products) {
      const productName = product.sync_product?.name || product.name || `Product ${product.id}`
      console.log(`📦 Processing: ${productName}`)
      
      try {
        // Get detailed product info
        const detailResponse = await fetch(`${PRINTFUL_BASE_URL}/store/products/${product.id}`, {
          headers: {
            'Authorization': `Bearer ${PRINTFUL_API_KEY}`
          }
        })

        if (!detailResponse.ok) {
          console.error(`Failed to fetch product ${product.id}`)
          continue
        }

        const productDetails = await detailResponse.json()
        const mainVariant = productDetails.result.sync_variants[0]
        
        // Download only the main mockup image
        let mainImagePath = null
        if (mainVariant?.files && mainVariant.files.length > 0) {
          const mainFile = mainVariant.files[0]
          if (mainFile.preview_url) {
            const filename = createSafeFilename(product.id, mainVariant.id, 'main', mainFile.preview_url)
            try {
              mainImagePath = await downloadImage(mainFile.preview_url, filename)
            } catch (downloadError) {
              console.error(`Failed to download image for ${productName}:`, downloadError)
            }
          }
        }

        // Update database
        const existingProduct = await prisma.product.findFirst({
          where: { printfulId: product.id.toString() }
        })

        if (existingProduct) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              images: mainImagePath ? [mainImagePath] : [],
              updatedAt: new Date()
            }
          })
          console.log(`✅ Updated: ${productName}`)
        } else {
          await prisma.product.create({
            data: {
              printfulId: product.id.toString(),
              name: productName,
              description: `High-quality ${productName} with professional design.`,
              price: parseFloat(mainVariant?.retail_price) || 19.99,
              images: mainImagePath ? [mainImagePath] : [],
              category: 'Apparel',
              subcategory: 'T-Shirts',
              inStock: true,
              featured: false,
              yourTotalProfit: 10.00,
              sku: `PRINTFUL-${product.id}`
            }
          })
          console.log(`✅ Created: ${productName}`)
        }
        
      } catch (productError) {
        console.error(`Error processing ${productName}:`, productError)
        continue
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Products synced successfully with images downloaded' 
    })
    
  } catch (error) {
    console.error('❌ Sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync products' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}