import { config } from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
config({ path: '.env.local' })

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY
console.log('🔑 API Key:', PRINTFUL_API_KEY ? `${PRINTFUL_API_KEY.substring(0, 8)}...` : 'NOT SET')

const testPrintfulAPI = async () => {
  try {
    console.log('🚀 Testing Printful API directly...')
    
    // First get store products
    const response = await fetch('https://api.printful.com/store/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
      return
    }

    const data = await response.json()
    console.log('✅ Success! Found', data.result?.length || 0, 'products')
    
    if (data.result && data.result.length > 0) {
      const productId = data.result[0].id
      console.log('📦 Store Product:', data.result[0])
      
      // Now get full product details
      console.log('\n🔍 Getting full product details...')
      const detailResponse = await fetch(`https://api.printful.com/store/products/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json()
        console.log('📋 Full Product Details:')
        console.log(JSON.stringify(detailData.result, null, 2))
      }
    }
    
    return data
  } catch (error) {
    console.error('💥 Fetch error:', error.message)
  }
}

testPrintfulAPI()