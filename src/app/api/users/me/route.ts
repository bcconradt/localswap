import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { updateProfileSchema } from '@/lib/validations'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        verifications: {
          where: { status: 'verified' },
          select: { type: true, verifiedAt: true },
        },
        travelerProfile: {
          where: { isActive: true },
          include: { location: true },
        },
        locations: {
          where: { isActive: true },
        },
      },
    })

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: fullUser.id,
      phone: fullUser.phone,
      email: fullUser.email,
      status: fullUser.status,
      role: fullUser.role,
      profile: fullUser.profile,
      verifications: fullUser.verifications,
      travelerProfile: fullUser.travelerProfile,
      locations: fullUser.locations,
      createdAt: fullUser.createdAt,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        displayName: data.displayName || 'User',
        ...data,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Update profile error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
