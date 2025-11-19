// API endpoint for syncing Printful products with image downloads
import { NextResponse } from 'next/server'
import { syncAllProductsWithImages } from '../../../../scripts/sync-printful-with-images.js'

export async function POST() {
  try {
    console.log('🚀 Starting full Printful sync with images...')
    
    // Run the comprehensive sync
    await syncAllProductsWithImages()
    
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
  }
}