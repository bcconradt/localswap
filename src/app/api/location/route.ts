import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { locationSchema } from '@/lib/validations'
import { encodeGeohash } from '@/lib/utils'

// GET /api/location - Get current location
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const location = await prisma.location.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { type: 'asc' }, // Prefer home
    })

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Get location error:', error)
    return NextResponse.json({ error: 'Failed to get location' }, { status: 500 })
  }
}

// POST /api/location - Set location
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = locationSchema.parse(body)

    const geohash = encodeGeohash(data.latitude, data.longitude)

    // Deactivate existing locations of same type
    await prisma.location.updateMany({
      where: { userId: user.id, type: data.type },
      data: { isActive: false },
    })

    const location = await prisma.location.create({
      data: {
        userId: user.id,
        type: data.type,
        latitude: data.latitude,
        longitude: data.longitude,
        geohash,
        city: data.city,
        neighborhood: data.neighborhood,
        radiusMiles: data.radiusMiles,
        isActive: true,
      },
    })

    // Update profile neighborhood if home location
    if (data.type === 'home' && data.neighborhood) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { neighborhood: data.neighborhood },
      })
    }

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Set location error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to set location' }, { status: 500 })
  }
}
