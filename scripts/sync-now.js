#!/usr/bin/env node

// Quick manual sync script for Printful images
// Usage: node sync-now.js

console.log('🚀 Starting Printful Image Sync...\n');

// Import and run the sync function
import { syncAllProductsWithImages } from './sync-printful-with-images.js';

syncAllProductsWithImages()
  .then(() => {
    console.log('\n✅ Sync completed successfully!');
    console.log('📂 Check public/printful-images/ for downloaded images');
    console.log('🔧 You can now manually replace any images via admin panel');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  });