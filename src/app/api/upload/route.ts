import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  generateFileKey,
  uploadFile,
  validateImageFile,
  getPresignedUploadUrl,
  isConfigured,
} from '@/lib/storage'

// POST /api/upload - Upload a file directly
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'listing'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validation = validateImageFile({
      size: file.size,
      type: file.type,
      name: file.name,
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate file key
    const key = generateFileKey(
      user.id,
      type as 'listing' | 'avatar' | 'message',
      file.name
    )

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload file
    const result = await uploadFile(key, buffer, file.type)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET /api/upload - Get a presigned URL for direct client upload
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const contentType = searchParams.get('contentType') || 'image/jpeg'
    const type = searchParams.get('type') || 'listing'

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    // Check if storage is configured
    if (!isConfigured()) {
      // Return mock response for development
      return NextResponse.json({
        success: true,
        uploadUrl: null,
        publicUrl: '/placeholder-image.jpg',
        key: generateFileKey(user.id, type as 'listing' | 'avatar' | 'message', filename),
        message: 'Storage not configured - using placeholder',
      })
    }

    // Generate file key
    const key = generateFileKey(
      user.id,
      type as 'listing' | 'avatar' | 'message',
      filename
    )

    // Get presigned URL
    const result = await getPresignedUploadUrl(key, contentType)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      key,
    })
  } catch (error) {
    console.error('Presigned URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
