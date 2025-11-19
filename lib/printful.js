// Printful API client
const PRINTFUL_API_BASE = 'https://api.printful.com'
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

// Pricing Strategy Configuration
const PRICING_CONFIG = {
  // You set €10 earnings in Printful, so we add minimal markup for competitive pricing
  MIN_PROFIT_MARGIN: 2.0,   // Small additional margin on top of Printful earnings
  MAX_PROFIT_MARGIN: 4.0,   // Keep competitive while maintaining profit
  PROFIT_PERCENTAGE: 0.15,  // 15% markup on Printful retail price
  SHIPPING_BUFFER: 1.0,     // €1 buffer since Printful handles most costs
  PREMIUM_CATEGORIES: {
    'hoodies': 3.0,         // Slightly higher for premium items
    'jackets': 4.0,
    'bags': 2.5
  }
}

export class PrintfulAPI {
  constructor() {
    if (!PRINTFUL_API_KEY) {
      throw new Error('PRINTFUL_API_KEY is not set in environment variables')
    }
  }

  async request(endpoint, options = {}) {
    const url = `${PRINTFUL_API_BASE}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  }

  // Get all store products
  async getStoreProducts(limit = 20, offset = 0) {
    return this.request(`/store/products?limit=${limit}&offset=${offset}`)
  }

  // Get specific product details
  async getStoreProduct(productId) {
    return this.request(`/store/products/${productId}`)
  }

  // Get product variants
  async getProductVariants(productId) {
    return this.request(`/store/variants/${productId}`)
  }

  // Get all categories
  async getCategories() {
    return this.request('/categories')
  }

  // Get product catalog (all available products)
  async getProducts(categoryId = null, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    
    if (categoryId) {
      params.append('category_id', categoryId)
    }
    
    return this.request(`/products?${params}`)
  }

  // Calculate retail price with small markup on top of Printful earnings
  // Since you set €10 earnings in Printful, this adds competitive markup
  calculateRetailPrice(printfulRetailPrice, category = 'default', productName = '') {
    const basePrice = parseFloat(printfulRetailPrice) || 0
    
    // Since Printful retail price already includes your €10 earnings,
    // we add a small competitive markup
    const totalCost = basePrice + PRICING_CONFIG.SHIPPING_BUFFER
    
    // Determine profit margin based on category
    let targetProfit = PRICING_CONFIG.MIN_PROFIT_MARGIN
    
    // Check for premium categories
    const lowerCategory = (category || '').toLowerCase()
    const lowerName = (productName || '').toLowerCase()
    
    for (const [premiumCat, premiumProfit] of Object.entries(PRICING_CONFIG.PREMIUM_CATEGORIES)) {
      if (lowerCategory.includes(premiumCat) || lowerName.includes(premiumCat)) {
        targetProfit = premiumProfit
        break
      }
    }
    
    // Calculate price with percentage markup as alternative
    const percentagePrice = totalCost * (1 + PRICING_CONFIG.PROFIT_PERCENTAGE)
    const targetPrice = totalCost + targetProfit
    
    // Use higher of the two methods, but cap at max profit
    const optimalPrice = Math.min(
      Math.max(percentagePrice, targetPrice),
      totalCost + PRICING_CONFIG.MAX_PROFIT_MARGIN
    )
    
    // Round to .99 pricing psychology
    return Math.ceil(optimalPrice) - 0.01
  }

  // Transform Printful product to our schema
  transformProduct(printfulProduct) {
    // Handle both store product and sync product formats
    const product = printfulProduct.sync_product || printfulProduct
    const variants = printfulProduct.sync_variants || []
    
    // For store products, we need to get variants separately
    const productName = product.name || printfulProduct.name
    const productId = product.id || printfulProduct.id
    
    // Use thumbnail from store product or sync product
    const thumbnailUrl = printfulProduct.thumbnail_url || product.thumbnail_url || product.main_category_id || ''
    
    // Calculate final retail price (Printful retail + small markup)
    // For store products with variants, use the first variant's price
    const baseVariant = variants[0] || {}
    const printfulRetailPrice = parseFloat(baseVariant.retail_price) || 20.0 // Use actual Printful retail price
    const finalRetailPrice = this.calculateRetailPrice(
      printfulRetailPrice,
      product.category?.name,
      productName
    )
    
    // Your total profit calculation based on estimated costs
    const printfulCost = printfulRetailPrice * 0.45 // Printful keeps ~45% for production costs
    const yourTotalProfit = finalRetailPrice - printfulCost

    return {
      id: productId?.toString(),
      name: productName,
      description: product.description || `High-quality ${productName}`,
      price: finalRetailPrice,
      printfulRetailPrice: printfulRetailPrice,
      printfulCost: printfulCost,
      yourTotalProfit: yourTotalProfit,
      printfulEarnings: 10.0, // You set €10 earnings in Printful
      imageSrc: thumbnailUrl || '/images/placeholder-product.jpg',
      imageAlt: productName,
      category: 'printful',
      subcategory: product.category?.name || 'apparel',
      brand: 'Printful',
      sku: product.external_id || printfulProduct.external_id || `PF-${productId}`,
      inStock: true,
      stockCount: 999, // Printful handles stock
      isActive: true,
      isFeatured: false,
      variants: variants.map(variant => {
        const printfulRetailPrice = parseFloat(variant.retail_price) || 20.0
        const finalRetailPrice = this.calculateRetailPrice(
          printfulRetailPrice,
          product.category?.name,
          productName
        )
        const printfulCost = printfulRetailPrice * 0.45 // Estimated cost (Printful keeps ~45% for costs)
        const yourTotalProfit = finalRetailPrice - printfulCost
        
        return {
          type: 'size',
          value: variant.size || 'Default',
          inStock: variant.availability_status === 'active',
          price: finalRetailPrice,
          printfulRetailPrice: printfulRetailPrice,
          printfulCost: printfulCost,
          yourTotalProfit: yourTotalProfit,
          printfulEarnings: 10.0
        }
      }),
      images: [
        // Add thumbnail as primary image
        {
          imageUrl: thumbnailUrl,
          altText: productName,
          order: 0
        },
        ...(variants.flatMap(variant => 
          variant.files?.map(file => ({
            imageUrl: file.preview_url,
            altText: `${productName} - ${variant.name || 'Variant'}`,
            order: 1
          })) || []
        )),
        ...(product.files?.map(file => ({
          imageUrl: file.preview_url,
          altText: productName,
          order: 2
        })) || [])
      ].filter(img => img.imageUrl)
    }
  }
}

export const printfulAPI = new PrintfulAPI()