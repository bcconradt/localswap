import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    // Check if the current user has blocked or is blocked by this user
    if (currentUser) {
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: currentUser.id, blockedId: id },
            { blockerId: id, blockedId: currentUser.id },
          ],
        },
      })

      if (block) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    const user = await prisma.user.findUnique({
      where: { id, status: 'active' },
      include: {
        profile: true,
        verifications: {
          where: { status: 'verified' },
          select: { type: true },
        },
        travelerProfile: {
          where: { isActive: true },
          select: {
            startDate: true,
            endDate: true,
            location: {
              select: { city: true, neighborhood: true },
            },
          },
        },
        receivedReviews: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            reviewer: {
              include: { profile: true },
            },
          },
        },
        listings: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            photos: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      profile: user.profile,
      verifications: user.verifications.map(v => v.type),
      travelerProfile: user.travelerProfile,
      reviews: user.receivedReviews,
      listings: user.listings,
      memberSince: user.createdAt,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
