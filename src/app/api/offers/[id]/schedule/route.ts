import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { scheduleMeetupSchema } from '@/lib/validations'

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
    const data = scheduleMeetupSchema.parse(body)

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { chatThread: true },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Only participants can schedule
    if (offer.offererId !== user.id && offer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Must be accepted
    if (offer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Offer must be accepted to schedule meetup' },
        { status: 400 }
      )
    }

    // Update offer with meetup details
    const updated = await prisma.offer.update({
      where: { id },
      data: {
        meetupLocation: data.location,
        meetupLatitude: data.latitude,
        meetupLongitude: data.longitude,
        meetupTime: data.time,
      },
    })

    // Add system message
    if (offer.chatThread) {
      await prisma.message.create({
        data: {
          threadId: offer.chatThread.id,
          senderId: user.id,
          type: 'system',
          content: `Meetup scheduled: ${data.location} on ${data.time.toLocaleDateString()} at ${data.time.toLocaleTimeString()}`,
          metadata: {
            offerId: offer.id,
            action: 'scheduled',
            location: data.location,
            time: data.time.toISOString(),
          },
        },
      })
    }

    // TODO: Send push notification, create calendar reminder

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Schedule meetup error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to schedule meetup' }, { status: 500 })
  }
}
