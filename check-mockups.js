import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

async function getAllMockupTemplates() {
  try {
    console.log('🔍 Checking for all available mockup templates...')

    // Get the first variant ID to check available mockups
    const response = await fetch('https://api.printful.com/store/products/403512376', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    const firstVariant = data.result.sync_variants[0]
    
    console.log(`📋 Checking variant: ${firstVariant.name}`)
    console.log(`🔗 Variant ID: ${firstVariant.id}`)

    // Get mockup templates for this variant
    const mockupResponse = await fetch(`https://api.printful.com/mockup-generator/templates/${firstVariant.product.product_id}`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (mockupResponse.ok) {
      const mockupData = await mockupResponse.json()
      console.log('🎨 Available mockup templates:')
      mockupData.result.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.title} (ID: ${template.template_id})`)
        console.log(`     ${template.image_url}`)
      })

      // Generate mockups for different angles
      console.log('\n🚀 Generating mockups for different views...')
      
      // Get the design file URL
      const designFile = firstVariant.files.find(f => f.type === 'default')
      if (designFile) {
        console.log(`🎨 Design file: ${designFile.preview_url}`)
        
        // Try to generate front and back mockups
        const mockupsToGenerate = mockupData.result.slice(0, 3) // First 3 templates
        
        for (const template of mockupsToGenerate) {
          const mockupGenResponse = await fetch('https://api.printful.com/mockup-generator/create-task/403512376', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              variant_ids: [firstVariant.variant_id],
              format: 'jpg',
              files: [
                {
                  placement: 'default',
                  image_url: designFile.preview_url,
                  position: {
                    area_width: 1800,
                    area_height: 2400,
                    width: 1800,
                    height: 1800,
                    top: 300,
                    left: 0
                  }
                }
              ]
            })
          })
          
          if (mockupGenResponse.ok) {
            const result = await mockupGenResponse.json()
            console.log(`✅ Created mockup task: ${result.result.task_key}`)
          }
        }
      }
    } else {
      console.log('❌ Could not fetch mockup templates')
    }

  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

getAllMockupTemplates()