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
      include: {
        chatThread: true,
        offerer: { include: { profile: true } },
        owner: { include: { profile: true } },
        listing: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Only participants can complete
    const isOfferer = offer.offererId === user.id
    const isOwner = offer.ownerId === user.id

    if (!isOfferer && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Must be accepted with scheduled meetup
    if (offer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Offer must be accepted' },
        { status: 400 }
      )
    }

    // Update completion status
    const updateData: { offererCompleted?: boolean; ownerCompleted?: boolean } = {}
    if (isOfferer) updateData.offererCompleted = true
    if (isOwner) updateData.ownerCompleted = true

    let updated = await prisma.offer.update({
      where: { id },
      data: updateData,
    })

    // Check if both parties completed
    const bothCompleted =
      (updated.offererCompleted || isOfferer) &&
      (updated.ownerCompleted || isOwner)

    if (bothCompleted || (updated.offererCompleted && updated.ownerCompleted)) {
      // Mark as completed
      updated = await prisma.offer.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      })

      // Update listing status
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: 'traded' },
      })

      // Update user stats
      await prisma.profile.updateMany({
        where: { userId: { in: [offer.offererId, offer.ownerId] } },
        data: { completedSwaps: { increment: 1 } },
      })

      // Add system message
      if (offer.chatThread) {
        await prisma.message.create({
          data: {
            threadId: offer.chatThread.id,
            senderId: user.id,
            type: 'system',
            content: 'Trade completed! Please leave a review for each other.',
            metadata: { offerId: offer.id, action: 'completed' },
          },
        })
      }
    } else {
      // Add message that one party marked complete
      if (offer.chatThread) {
        await prisma.message.create({
          data: {
            threadId: offer.chatThread.id,
            senderId: user.id,
            type: 'system',
            content: `${isOfferer ? 'Offerer' : 'Owner'} marked trade as complete. Waiting for other party.`,
            metadata: { offerId: offer.id, action: 'partial_complete' },
          },
        })
      }
    }

    return NextResponse.json({
      ...updated,
      bothCompleted: updated.offererCompleted && updated.ownerCompleted,
    })
  } catch (error) {
    console.error('Complete offer error:', error)
    return NextResponse.json({ error: 'Failed to complete offer' }, { status: 500 })
  }
}
