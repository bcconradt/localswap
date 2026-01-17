import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/offers/[id] - Get offer detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            photos: { orderBy: { position: 'asc' } },
            user: { include: { profile: true } },
          },
        },
        items: {
          include: {
            listing: {
              include: {
                photos: { orderBy: { position: 'asc' }, take: 1 },
              },
            },
          },
        },
        offerer: { include: { profile: true } },
        owner: { include: { profile: true } },
        chatThread: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
        parentOffer: true,
        counterOffers: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Only participants can view
    if (offer.offererId !== user.id && offer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      ...offer,
      isOfferer: offer.offererId === user.id,
      canAccept: offer.status === 'pending' || offer.status === 'countered',
      canCounter: offer.status === 'pending' || offer.status === 'countered',
      canSchedule: offer.status === 'accepted',
      canComplete: offer.status === 'accepted' && offer.meetupTime !== null,
      canReview: offer.status === 'completed',
    })
  } catch (error) {
    console.error('Get offer error:', error)
    return NextResponse.json({ error: 'Failed to get offer' }, { status: 500 })
  }
}
