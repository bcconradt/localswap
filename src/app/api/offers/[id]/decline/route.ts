import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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

    // Only owner can decline
    if (offer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check status
    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return NextResponse.json(
        { error: 'Offer cannot be declined' },
        { status: 400 }
      )
    }

    // Update offer
    const updated = await prisma.offer.update({
      where: { id },
      data: { status: 'declined' },
    })

    // Add system message
    if (offer.chatThread) {
      await prisma.message.create({
        data: {
          threadId: offer.chatThread.id,
          senderId: user.id,
          type: 'system',
          content: 'Offer declined.',
          metadata: { offerId: offer.id, action: 'declined' },
        },
      })
    }

    // TODO: Send push notification

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Decline offer error:', error)
    return NextResponse.json({ error: 'Failed to decline offer' }, { status: 500 })
  }
}
