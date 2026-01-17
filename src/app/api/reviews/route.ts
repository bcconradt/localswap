import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createReviewSchema } from '@/lib/validations'

// GET /api/reviews - Get user's reviews
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'given' | 'received'

    const where =
      type === 'given'
        ? { reviewerId: user.id }
        : type === 'received'
        ? { revieweeId: user.id, isVisible: true }
        : {
            OR: [
              { reviewerId: user.id },
              { revieweeId: user.id, isVisible: true },
            ],
          }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          include: { profile: true },
        },
        reviewee: {
          include: { profile: true },
        },
        offer: {
          include: {
            listing: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Failed to get reviews' }, { status: 500 })
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createReviewSchema.parse(body)

    // Get the offer
    const offer = await prisma.offer.findUnique({
      where: { id: data.offerId },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Must be completed
    if (offer.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed trades' },
        { status: 400 }
      )
    }

    // Must be a participant
    const isOfferer = offer.offererId === user.id
    const isOwner = offer.ownerId === user.id

    if (!isOfferer && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Determine reviewee
    const revieweeId = isOfferer ? offer.ownerId : offer.offererId

    // Check for existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        offerId_reviewerId: {
          offerId: data.offerId,
          reviewerId: user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this trade' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        offerId: data.offerId,
        reviewerId: user.id,
        revieweeId,
        rating: data.rating,
        tags: data.tags || [],
        comment: data.comment,
        isVisible: false, // Will be made visible when both submit
      },
    })

    // Check if both parties have now reviewed
    const otherReview = await prisma.review.findUnique({
      where: {
        offerId_reviewerId: {
          offerId: data.offerId,
          reviewerId: revieweeId,
        },
      },
    })

    if (otherReview) {
      // Make both reviews visible
      await prisma.review.updateMany({
        where: { offerId: data.offerId },
        data: { isVisible: true },
      })

      // Recalculate trust scores for both users
      await recalculateTrustScore(user.id)
      await recalculateTrustScore(revieweeId)
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

async function recalculateTrustScore(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId, isVisible: true },
    select: { rating: true },
  })

  if (reviews.length === 0) return

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.profile.update({
    where: { userId },
    data: { trustScore: avgRating },
  })
}
