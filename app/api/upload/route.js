import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    console.log('Upload API called...')
    
    const formData = await request.formData()
    const file = formData.get('file')
    
    console.log('File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file')
    
    if (!file) {
      console.log('No file in request')
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}`)
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP and GIF are allowed.` },
        { status: 400 }
      )
    }

    // Validate file size (10MB max - increased limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log(`File too large: ${file.size} bytes`)
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const extension = path.extname(file.name) || '.jpg'
    const filename = `${timestamp}_${random}${extension}`

    console.log(`Generated filename: ${filename}`)

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    console.log(`Upload directory: ${uploadDir}`)
    
    try {
      await mkdir(uploadDir, { recursive: true })
      console.log('Upload directory ensured')
    } catch (dirError) {
      console.log('Directory already exists or creation failed:', dirError.message)
    }

    // Save file
    const filepath = path.join(uploadDir, filename)
    console.log(`Saving file to: ${filepath}`)
    
    await writeFile(filepath, buffer)
    console.log('File saved successfully')

    // Return the public URL
    const publicUrl = `/uploads/${filename}`
    console.log(`Public URL: ${publicUrl}`)

    const response = {
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    }
    
    console.log('Upload successful, returning:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}