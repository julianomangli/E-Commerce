// Enhanced Printful Product Sync with Image Download
// This script downloads all product images from Printful API and stores them locally

import fs from 'fs';
import path from 'path';
import https from 'https';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Printful API configuration
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_BASE_URL = 'https://api.printful.com';

// Local image storage path
const IMAGES_DIR = path.join(path.dirname(__dirname), 'public', 'printful-images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Download image from URL and save locally
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(IMAGES_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✅ Image already exists: ${filename}`);
      return resolve(`/printful-images/${filename}`);
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`📥 Downloaded: ${filename}`);
        resolve(`/printful-images/${filename}`);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete partial file
      console.error(`❌ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

// Get file extension from URL
function getFileExtension(url) {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath);
  return ext || '.jpg'; // Default to .jpg if no extension
}

// Create safe filename from product info
function createSafeFilename(productId, variantId, imageIndex, url) {
  const ext = getFileExtension(url);
  return `product_${productId}_variant_${variantId}_${imageIndex}${ext}`;
}

// Fetch all products from Printful
async function fetchPrintfulProducts() {
  try {
    console.log('🔍 Fetching products from Printful...');
    
    const response = await fetch(`${PRINTFUL_BASE_URL}/store/products`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📦 Found ${data.result.length} products`);
    
    return data.result;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
}

// Fetch detailed product info including variants and images
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`${PRINTFUL_BASE_URL}/store/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product ${productId}: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`❌ Error fetching product ${productId}:`, error);
    throw error;
  }
}

// Process and download only the main product image
async function processProductImages(product) {
  const productName = product.sync_product?.name || product.name || `Product ${product.id}`;
  console.log(`\n🖼️ Processing main image for: ${productName}`);
  
  const allImages = [];
  const downloadPromises = [];

  try {
    // Get detailed product info
    const productDetails = await fetchProductDetails(product.id);
    
    // Get the first variant (main variant) only
    const mainVariant = productDetails.sync_variants[0];
    
    if (mainVariant) {
      console.log(`  📱 Processing main variant: ${mainVariant.name}`);
      
      // Download ONLY the first mockup file (your main design)
      if (mainVariant.files && mainVariant.files.length > 0) {
        const mainFile = mainVariant.files[0]; // Only the first/main mockup
        if (mainFile.preview_url) {
          const filename = createSafeFilename(product.id, mainVariant.id, 'main', mainFile.preview_url);
          downloadPromises.push(
            downloadImage(mainFile.preview_url, filename).then(localPath => ({
              variantId: mainVariant.id,
              type: 'main_mockup',
              originalUrl: mainFile.preview_url,
              localPath: localPath,
              filename: filename
            }))
          );
        }
      }
    }

    // Wait for download to complete
    const downloadedImages = await Promise.allSettled(downloadPromises);
    
    // Collect successful downloads
    downloadedImages.forEach(result => {
      if (result.status === 'fulfilled') {
        allImages.push(result.value);
      } else {
        console.error('❌ Download failed:', result.reason.message);
      }
    });

    console.log(`✅ Downloaded ${allImages.length} main image for ${productName}`);
    return allImages;

  } catch (error) {
    console.error(`❌ Error processing product images:`, error);
    return [];
  }
}

// Update database with downloaded images
async function updateProductInDatabase(product, downloadedImages) {
  try {
    const productName = product.sync_product?.name || product.name || `Product ${product.id}`;
    console.log(`💾 Updating database for: ${productName}`);
    
    // Check if product already exists
    let dbProduct = await prisma.product.findFirst({
      where: { printfulId: product.id.toString() }
    });

    // Get the single main image
    const mainImage = downloadedImages.length > 0 ? [downloadedImages[0].localPath] : [];

    // Get the main variant for product data
    const productDetails = await fetchProductDetails(product.id);
    const mainVariant = productDetails.sync_variants[0];

    if (dbProduct) {
      // Update existing product with new main image
      await prisma.product.update({
        where: { id: dbProduct.id },
        data: {
          images: mainImage,
          updatedAt: new Date()
        }
      });
      console.log(`✅ Updated existing product: ${productName}`);
    } else {
      // Create new product with main image
      await prisma.product.create({
        data: {
          printfulId: product.id.toString(),
          name: productName,
          description: `High-quality ${productName} with professional design. Additional images can be added manually via admin panel.`,
          price: parseFloat(mainVariant?.retail_price) || 19.99,
          images: mainImage,
          category: 'Apparel',
          subcategory: 'T-Shirts',
          inStock: true,
          featured: false,
          yourTotalProfit: 10.00 // Base profit
        }
      });
      console.log(`✅ Created new product: ${productName}`);
    }

  } catch (error) {
    console.error(`❌ Database error for ${productName}:`, error);
  }
}

// Main sync function
async function syncAllProductsWithImages() {
  console.log('🚀 Starting comprehensive Printful sync with image downloads...\n');
  
  try {
    // Fetch all products
    const products = await fetchPrintfulProducts();
    
    if (products.length === 0) {
      console.log('⚠️ No products found in Printful store');
      return;
    }

    // Process each product
    for (const product of products) {
      try {
        const productName = product.sync_product?.name || product.name || `Product ${product.id}`;
        console.log(`\n📦 Processing: ${productName}`);
        
        // Download all images for this product
        const downloadedImages = await processProductImages(product);
        
        // Update database with product and image info
        await updateProductInDatabase(product, downloadedImages);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        const errorProductName = product.sync_product?.name || product.name || product.id;
        console.error(`❌ Error processing product ${errorProductName}:`, error);
        continue; // Continue with next product
      }
    }

    console.log('\n🎉 Sync completed successfully!');
    console.log(`📂 All images saved to: ${IMAGES_DIR}`);
    console.log('💡 You can now manually replace any images in the admin panel');

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export {
  syncAllProductsWithImages,
  downloadImage,
  fetchPrintfulProducts,
  processProductImages
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllProductsWithImages()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}