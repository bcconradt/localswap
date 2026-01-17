import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notifyOfferAccepted } from '@/lib/notifications'

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

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { chatThread: true },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Only owner can accept
    if (offer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check status
    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return NextResponse.json(
        { error: 'Offer cannot be accepted' },
        { status: 400 }
      )
    }

    // Update offer
    const updated = await prisma.offer.update({
      where: { id },
      data: { status: 'accepted' },
    })

    // Add system message
    if (offer.chatThread) {
      await prisma.message.create({
        data: {
          threadId: offer.chatThread.id,
          senderId: user.id,
          type: 'system',
          content: 'Offer accepted! Schedule a meetup to complete the trade.',
          metadata: { offerId: offer.id, action: 'accepted' },
        },
      })
    }

    // Send notification to offerer
    const [ownerProfile, listing] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId: user.id },
        select: { displayName: true },
      }),
      prisma.listing.findUnique({
        where: { id: offer.listingId },
        select: { id: true, title: true },
      }),
    ])
    await notifyOfferAccepted(
      offer.offererId,
      ownerProfile?.displayName || 'Someone',
      listing?.title || 'a listing',
      offer.id,
      offer.listingId
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Accept offer error:', error)
    return NextResponse.json({ error: 'Failed to accept offer' }, { status: 500 })
  }
}
