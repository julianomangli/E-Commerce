import { NextResponse } from 'next/server'
import { printfulAPI } from '../../../lib/printful'
import { prisma } from '../../../lib/prisma'

async function saveProductToDatabase(product) {
  try {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { sku: product.sku }
    })

    if (existingProduct) {
      // Update existing product
      const updatedProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageSrc: product.imageSrc,
          imageAlt: product.imageAlt,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          inStock: product.inStock,
          stockCount: product.stockCount,
          isActive: product.isActive,
          isFeatured: product.isFeatured
        }
      })

      // Update variants
      await prisma.productVariant.deleteMany({
        where: { productId: updatedProduct.id }
      })

      if (product.variants && product.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: product.variants.map(variant => ({
            productId: updatedProduct.id,
            type: variant.type,
            value: variant.value,
            inStock: variant.inStock
          }))
        })
      }

      // Update images
      await prisma.productImage.deleteMany({
        where: { productId: updatedProduct.id }
      })

      if (product.images && product.images.length > 0) {
        await prisma.productImage.createMany({
          data: product.images.map(image => ({
            productId: updatedProduct.id,
            imageUrl: image.imageUrl,
            altText: image.altText,
            order: image.order
          }))
        })
      }

      return updatedProduct
    } else {
      // Create new product
      const newProduct = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          imageSrc: product.imageSrc,
          imageAlt: product.imageAlt,
          category: product.category,
          subcategory: product.subcategory,
          brand: product.brand,
          sku: product.sku,
          weight: 0.3, // Default weight for t-shirts
          dimensions: '',
          tags: 'printful,anime,goku',
          inStock: product.inStock,
          stockCount: product.stockCount,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          viewCount: 0,
          saleCount: 0
        }
      })

      // Add variants
      if (product.variants && product.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: product.variants.map(variant => ({
            productId: newProduct.id,
            type: variant.type,
            value: variant.value,
            inStock: variant.inStock
          }))
        })
      }

      // Add images
      if (product.images && product.images.length > 0) {
        await prisma.productImage.createMany({
          data: product.images.map(image => ({
            productId: newProduct.id,
            imageUrl: image.imageUrl,
            altText: image.altText,
            order: image.order
          }))
        })
      }

      return newProduct
    }
  } catch (error) {
    console.error('Database save error:', error)
    throw error
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sync = searchParams.get('sync') === 'true'
    const productId = searchParams.get('id')

    if (productId) {
      // Get specific product
      const response = await printfulAPI.getStoreProduct(productId)
      const transformedProduct = printfulAPI.transformProduct(response.result)
      
      return NextResponse.json({
        success: true,
        product: transformedProduct
      })
    }

    // Get all store products
    const response = await printfulAPI.getStoreProducts(50, 0)
    
    // Fetch full details for each product (including variants)
    const productsWithDetails = await Promise.all(
      response.result.map(async (storeProduct) => {
        try {
          const detailResponse = await printfulAPI.getStoreProduct(storeProduct.id)
          return detailResponse.result
        } catch (error) {
          console.error(`Error fetching details for product ${storeProduct.id}:`, error.message)
          // Return store product with empty variants as fallback
          return {
            sync_product: storeProduct,
            sync_variants: []
          }
        }
      })
    )

    const transformedProducts = productsWithDetails.map(item => 
      printfulAPI.transformProduct(item)
    )

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total: response.paging?.total || transformedProducts.length
    })

  } catch (error) {
    console.error('Printful API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch Printful products' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'sync_product':
        // Sync a specific Printful product to our database
        const { productId } = data
        const response = await printfulAPI.getStoreProduct(productId)
        const transformedProduct = printfulAPI.transformProduct(response.result)
        
        // Save to database
        const savedProduct = await saveProductToDatabase(transformedProduct)
        
        return NextResponse.json({
          success: true,
          message: 'Product synced successfully',
          product: transformedProduct,
          databaseProduct: savedProduct
        })

      case 'sync_all':
        // Sync all Printful products to database
        const allProductsResponse = await printfulAPI.getStoreProducts(100, 0)
        
        // Fetch full details for each product
        const allProductsWithDetails = await Promise.all(
          allProductsResponse.result.map(async (storeProduct) => {
            try {
              const detailResponse = await printfulAPI.getStoreProduct(storeProduct.id)
              return detailResponse.result
            } catch (error) {
              console.error(`Error fetching details for product ${storeProduct.id}:`, error.message)
              return {
                sync_product: storeProduct,
                sync_variants: []
              }
            }
          })
        )

        const allTransformed = allProductsWithDetails.map(item => 
          printfulAPI.transformProduct(item)
        )

        // Save all to database
        const savedProducts = await Promise.all(
          allTransformed.map(product => saveProductToDatabase(product))
        )
        
        return NextResponse.json({
          success: true,
          message: `${savedProducts.length} products synced to database`,
          products: allTransformed,
          databaseProducts: savedProducts
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Printful sync error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to sync Printful products' 
      },
      { status: 500 }
    )
  }
}