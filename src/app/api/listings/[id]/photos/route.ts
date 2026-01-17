import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import {
  generateFileKey,
  uploadFile,
  deleteFile,
  validateImageFile,
} from '@/lib/storage'
import { notifyInterestedUsers } from '@/lib/interest-matching'

// POST /api/listings/[id]/photos - Upload photos to a listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true },
    })

    if (!listing || listing.userId !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check photo limit (max 8)
    if (listing.photos.length >= 8) {
      return NextResponse.json(
        { error: 'Maximum 8 photos per listing' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Check if adding these would exceed limit
    if (listing.photos.length + files.length > 8) {
      return NextResponse.json(
        { error: `Can only add ${8 - listing.photos.length} more photos` },
        { status: 400 }
      )
    }

    const uploadedPhotos: { id: string; url: string; position: number }[] = []
    const errors: { file: string; error: string | undefined }[] = []

    for (const file of files) {
      // Validate file
      const validation = validateImageFile({
        size: file.size,
        type: file.type,
        name: file.name,
      })

      if (!validation.valid) {
        errors.push({ file: file.name, error: validation.error })
        continue
      }

      // Generate key and upload
      const key = generateFileKey(user.id, 'listing', file.name)
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadFile(key, buffer, file.type)

      if (result.success && result.url) {
        // Create photo record
        const photo = await prisma.listingPhoto.create({
          data: {
            listingId: id,
            url: result.url,
            thumbnailUrl: result.url, // TODO: Generate actual thumbnails
            position: listing.photos.length + uploadedPhotos.length,
          },
        })
        uploadedPhotos.push(photo)
      } else {
        errors.push({ file: file.name, error: result.error || 'Upload failed' })
      }
    }

    // Update listing photo count and primary photo
    if (uploadedPhotos.length > 0) {
      const allPhotos = await prisma.listingPhoto.findMany({
        where: { listingId: id },
        orderBy: { position: 'asc' },
      })

      const wasActivated = listing.status === 'draft' && allPhotos.length > 0

      await prisma.listing.update({
        where: { id },
        data: {
          photoCount: allPhotos.length,
          primaryPhotoUrl: allPhotos[0]?.url || null,
          // Auto-activate listing if it has at least one photo and was draft
          status: wasActivated ? 'active' : undefined,
        },
      })

      // Notify interested users when listing becomes active
      if (wasActivated) {
        notifyInterestedUsers(id).catch((err) =>
          console.error('Failed to notify interested users:', err)
        )
      }
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE /api/listings/[id]/photos - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }

    // Verify listing ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing || listing.userId !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Find and delete photo
    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
    })

    if (!photo || photo.listingId !== id) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from storage
    const urlParts = photo.url.split('/')
    const key = urlParts.slice(-3).join('/') // Extract key from URL
    await deleteFile(key)

    // Delete from database
    await prisma.listingPhoto.delete({
      where: { id: photoId },
    })

    // Reorder remaining photos and update listing
    const remainingPhotos = await prisma.listingPhoto.findMany({
      where: { listingId: id },
      orderBy: { position: 'asc' },
    })

    // Update positions
    for (let i = 0; i < remainingPhotos.length; i++) {
      if (remainingPhotos[i].position !== i) {
        await prisma.listingPhoto.update({
          where: { id: remainingPhotos[i].id },
          data: { position: i },
        })
      }
    }

    // Update listing
    await prisma.listing.update({
      where: { id },
      data: {
        photoCount: remainingPhotos.length,
        primaryPhotoUrl: remainingPhotos[0]?.url || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
