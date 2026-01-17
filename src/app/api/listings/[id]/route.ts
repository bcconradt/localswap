import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { updateListingSchema } from '@/lib/validations'

// GET /api/listings/[id] - Get listing detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { position: 'asc' },
        },
        user: {
          include: {
            profile: true,
            verifications: {
              where: { status: 'verified' },
              select: { type: true },
            },
            travelerProfile: {
              where: { isActive: true },
            },
          },
        },
        location: true,
      },
    })

    if (!listing || listing.status === 'deleted') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check blocks
    if (currentUser) {
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: currentUser.id, blockedId: listing.userId },
            { blockerId: listing.userId, blockedId: currentUser.id },
          ],
        },
      })

      if (block) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      subcategory: listing.subcategory,
      condition: listing.condition,
      isService: listing.isService,
      wantsType: listing.wantsType,
      wantsCategories: listing.wantsCategories,
      wantsDescription: listing.wantsDescription,
      availability: listing.availability,
      preferredMeetupArea: listing.preferredMeetupArea,
      status: listing.status,
      photos: listing.photos,
      user: {
        id: listing.user.id,
        displayName: listing.user.profile?.displayName,
        avatarUrl: listing.user.profile?.avatarUrl,
        bio: listing.user.profile?.bio,
        trustScore: listing.user.profile?.trustScore,
        completedSwaps: listing.user.profile?.completedSwaps,
        responseRate: listing.user.profile?.responseRate,
        verifications: listing.user.verifications.map(v => v.type),
        isTraveler: !!listing.user.travelerProfile,
        memberSince: listing.user.createdAt,
      },
      location: {
        city: listing.location.city,
        neighborhood: listing.location.neighborhood,
      },
      createdAt: listing.createdAt,
      isOwner: currentUser?.id === listing.userId,
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json({ error: 'Failed to get listing' }, { status: 500 })
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing || listing.userId !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = updateListingSchema.parse(body)

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        wantsCategories: data.wantsCategories || undefined,
      },
      include: {
        photos: {
          orderBy: { position: 'asc' },
        },
        location: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update listing error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

// DELETE /api/listings/[id] - Soft delete listing
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

    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing || listing.userId !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'deleted' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
