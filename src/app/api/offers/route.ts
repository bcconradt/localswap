import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createOfferSchema } from '@/lib/validations'
import { getOfferExpiry } from '@/lib/utils'

// GET /api/offers - Get user's offers
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' | 'received'
    const status = searchParams.get('status')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (type === 'sent') {
      where.offererId = user.id
    } else if (type === 'received') {
      where.ownerId = user.id
    } else {
      where.OR = [{ offererId: user.id }, { ownerId: user.id }]
    }

    if (status) {
      where.status = status
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
        items: {
          include: {
            listing: {
              include: {
                photos: {
                  orderBy: { position: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
        offerer: {
          include: { profile: true },
        },
        owner: {
          include: { profile: true },
        },
        chatThread: {
          select: {
            id: true,
            lastMessageAt: true,
            lastMessagePreview: true,
            unreadCounts: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      offers: offers.map(offer => ({
        id: offer.id,
        status: offer.status,
        message: offer.message,
        listing: {
          id: offer.listing.id,
          title: offer.listing.title,
          photo: offer.listing.photos[0] || null,
        },
        items: offer.items.map(item => ({
          id: item.id,
          description: item.description,
          photoUrl: item.photoUrl,
          listing: item.listing ? {
            id: item.listing.id,
            title: item.listing.title,
            photo: item.listing.photos[0] || null,
          } : null,
        })),
        offerer: {
          id: offer.offerer.id,
          displayName: offer.offerer.profile?.displayName,
          avatarUrl: offer.offerer.profile?.avatarUrl,
        },
        owner: {
          id: offer.owner.id,
          displayName: offer.owner.profile?.displayName,
          avatarUrl: offer.owner.profile?.avatarUrl,
        },
        meetup: offer.meetupTime ? {
          location: offer.meetupLocation,
          time: offer.meetupTime,
        } : null,
        chatThread: offer.chatThread,
        isOfferer: offer.offererId === user.id,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        expiresAt: offer.expiresAt,
      })),
    })
  } catch (error) {
    console.error('Get offers error:', error)
    return NextResponse.json({ error: 'Failed to get offers' }, { status: 500 })
  }
}

// POST /api/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createOfferSchema.parse(body)

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
    })

    if (!listing || listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Can't offer on your own listing
    if (listing.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot make offer on your own listing' },
        { status: 400 }
      )
    }

    // Check for existing pending offer
    const existingOffer = await prisma.offer.findFirst({
      where: {
        listingId: data.listingId,
        offererId: user.id,
        status: { in: ['pending', 'countered'] },
      },
    })

    if (existingOffer) {
      return NextResponse.json(
        { error: 'You already have a pending offer on this listing' },
        { status: 400 }
      )
    }

    // Check blocks
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: listing.userId },
          { blockerId: listing.userId, blockedId: user.id },
        ],
      },
    })

    if (block) {
      return NextResponse.json({ error: 'Cannot make offer' }, { status: 400 })
    }

    // Rate limiting for new accounts
    const accountAge = Date.now() - new Date(user.createdAt).getTime()
    const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000 // 7 days

    if (isNewAccount) {
      const todayOffers = await prisma.offer.count({
        where: {
          offererId: user.id,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })

      if (todayOffers >= 5) {
        return NextResponse.json(
          { error: 'Daily offer limit reached for new accounts' },
          { status: 429 }
        )
      }
    }

    // Create offer with items and chat thread
    const offer = await prisma.offer.create({
      data: {
        listingId: data.listingId,
        offererId: user.id,
        ownerId: listing.userId,
        message: data.message,
        expiresAt: getOfferExpiry(),
        items: {
          create: data.items.map(item => ({
            listingId: item.listingId,
            description: item.description,
            photoUrl: item.photoUrl,
          })),
        },
        chatThread: {
          create: {
            participants: {
              connect: [{ id: user.id }, { id: listing.userId }],
            },
          },
        },
      },
      include: {
        items: true,
        chatThread: true,
      },
    })

    // Create system message for the offer
    if (offer.chatThread) {
      await prisma.message.create({
        data: {
          threadId: offer.chatThread.id,
          senderId: user.id,
          type: 'offer_card',
          content: 'New offer',
          metadata: { offerId: offer.id, action: 'created' },
        },
      })
    }

    // TODO: Send push notification to listing owner

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error('Create offer error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
  }
}
