import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { travelerProfileSchema } from '@/lib/validations'
import { encodeGeohash } from '@/lib/utils'

// GET /api/traveler - Get traveler profile
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const travelerProfile = await prisma.travelerProfile.findUnique({
      where: { userId: user.id },
      include: { location: true },
    })

    return NextResponse.json({ travelerProfile })
  } catch (error) {
    console.error('Get traveler profile error:', error)
    return NextResponse.json({ error: 'Failed to get traveler profile' }, { status: 500 })
  }
}

// POST /api/traveler - Activate traveler mode
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = travelerProfileSchema.parse(body)

    // Validate dates
    if (data.endDate <= data.startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Deactivate existing traveler profile
    await prisma.travelerProfile.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    })

    // Deactivate existing traveler locations
    await prisma.location.updateMany({
      where: { userId: user.id, type: 'traveler' },
      data: { isActive: false },
    })

    // Create traveler location
    const geohash = encodeGeohash(data.latitude, data.longitude)
    const location = await prisma.location.create({
      data: {
        userId: user.id,
        type: 'traveler',
        latitude: data.latitude,
        longitude: data.longitude,
        geohash,
        city: data.city,
        neighborhood: data.neighborhood,
        radiusMiles: data.radiusMiles,
        isActive: true,
      },
    })

    // Create traveler profile
    const travelerProfile = await prisma.travelerProfile.create({
      data: {
        userId: user.id,
        locationId: location.id,
        startDate: data.startDate,
        endDate: data.endDate,
        availabilityWindows: data.availabilityWindows,
        isActive: true,
      },
      include: { location: true },
    })

    return NextResponse.json(travelerProfile, { status: 201 })
  } catch (error) {
    console.error('Activate traveler mode error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to activate traveler mode' }, { status: 500 })
  }
}

// PATCH /api/traveler - Update traveler settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const travelerProfile = await prisma.travelerProfile.findFirst({
      where: { userId: user.id, isActive: true },
    })

    if (!travelerProfile) {
      return NextResponse.json(
        { error: 'No active traveler profile' },
        { status: 404 }
      )
    }

    const updated = await prisma.travelerProfile.update({
      where: { id: travelerProfile.id },
      data: {
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        availabilityWindows: body.availabilityWindows,
      },
      include: { location: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update traveler profile error:', error)
    return NextResponse.json({ error: 'Failed to update traveler profile' }, { status: 500 })
  }
}

// DELETE /api/traveler - Deactivate traveler mode
export async function DELETE() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deactivate traveler profile
    await prisma.travelerProfile.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    })

    // Deactivate traveler locations
    await prisma.location.updateMany({
      where: { userId: user.id, type: 'traveler' },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deactivate traveler mode error:', error)
    return NextResponse.json({ error: 'Failed to deactivate traveler mode' }, { status: 500 })
  }
}
