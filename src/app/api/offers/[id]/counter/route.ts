import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { counterOfferSchema } from '@/lib/validations'
import { getOfferExpiry } from '@/lib/utils'

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

    const body = await request.json()
    const data = counterOfferSchema.parse(body)

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { chatThread: true },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Only owner can counter
    if (offer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check status
    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return NextResponse.json(
        { error: 'Cannot counter this offer' },
        { status: 400 }
      )
    }

    // Mark original as countered
    await prisma.offer.update({
      where: { id },
      data: { status: 'countered' },
    })

    // Create counter-offer
    const counterOffer = await prisma.offer.create({
      data: {
        listingId: offer.listingId,
        offererId: offer.ownerId, // Owner becomes offerer
        ownerId: offer.offererId, // Original offerer becomes owner
        message: data.message,
        parentOfferId: offer.id,
        expiresAt: getOfferExpiry(),
        items: {
          create: data.items.map(item => ({
            listingId: item.listingId,
            description: item.description,
            photoUrl: item.photoUrl,
          })),
        },
      },
      include: { items: true },
    })

    // Add message to existing thread
    if (offer.chatThread) {
      await prisma.message.create({
        data: {
          threadId: offer.chatThread.id,
          senderId: user.id,
          type: 'offer_card',
          content: 'Counter-offer',
          metadata: { offerId: counterOffer.id, action: 'countered' },
        },
      })
    }

    // TODO: Send push notification

    return NextResponse.json(counterOffer, { status: 201 })
  } catch (error) {
    console.error('Counter offer error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to counter offer' }, { status: 500 })
  }
}
