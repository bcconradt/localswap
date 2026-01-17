import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createListingSchema, listingSearchSchema } from '@/lib/validations'
import { encodeGeohash } from '@/lib/utils'

// GET /api/listings - Search and browse listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const query = listingSearchSchema.parse(params)

    const currentUser = await getCurrentUser()

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'active',
    }

    // Category filter
    if (query.category) {
      where.category = query.category
    }

    // Condition filter
    if (query.condition) {
      where.condition = query.condition
    }

    // Service filter
    if (query.isService !== undefined) {
      where.isService = query.isService
    }

    // Text search
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ]
    }

    // Exclude blocked users
    if (currentUser) {
      const blockedIds = await prisma.block.findMany({
        where: {
          OR: [
            { blockerId: currentUser.id },
            { blockedId: currentUser.id },
          ],
        },
        select: { blockerId: true, blockedId: true },
      })

      const excludeIds = new Set<string>()
      blockedIds.forEach(b => {
        if (b.blockerId !== currentUser.id) excludeIds.add(b.blockerId)
        if (b.blockedId !== currentUser.id) excludeIds.add(b.blockedId)
      })

      if (excludeIds.size > 0) {
        where.userId = { notIn: Array.from(excludeIds) }
      }
    }

    // Traveler filter
    if (!query.includeTravelers) {
      where.location = { type: 'home' }
    }

    // Geo filtering - basic implementation
    // For production, use PostGIS or a dedicated geo service
    let listings = await prisma.listing.findMany({
      where,
      include: {
        photos: {
          orderBy: { position: 'asc' },
          take: 1,
        },
        user: {
          include: {
            profile: true,
            travelerProfile: {
              where: { isActive: true },
            },
          },
        },
        location: true,
      },
      orderBy: query.sort === 'recent'
        ? { createdAt: 'desc' }
        : { createdAt: 'desc' }, // TODO: implement distance and relevance sorting
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    })

    // If geo params provided, filter by distance
    if (query.lat && query.lng) {
      // For MVP: simple bounding box filter
      // In production, use PostGIS ST_DWithin
      const latRange = query.radius / 69 // ~69 miles per degree latitude
      const lngRange = query.radius / (69 * Math.cos(query.lat * Math.PI / 180))

      listings = listings.filter(listing => {
        const lat = Number(listing.location.latitude)
        const lng = Number(listing.location.longitude)
        return (
          lat >= query.lat! - latRange &&
          lat <= query.lat! + latRange &&
          lng >= query.lng! - lngRange &&
          lng <= query.lng! + lngRange
        )
      })
    }

    // Get total count for pagination
    const total = await prisma.listing.count({ where })

    return NextResponse.json({
      listings: listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        isService: listing.isService,
        wantsType: listing.wantsType,
        wantsCategories: listing.wantsCategories,
        wantsDescription: listing.wantsDescription,
        primaryPhoto: listing.photos[0] || null,
        user: {
          id: listing.user.id,
          displayName: listing.user.profile?.displayName,
          avatarUrl: listing.user.profile?.avatarUrl,
          trustScore: listing.user.profile?.trustScore,
          completedSwaps: listing.user.profile?.completedSwaps,
          isTraveler: !!listing.user.travelerProfile,
        },
        location: {
          city: listing.location.city,
          neighborhood: listing.location.neighborhood,
        },
        createdAt: listing.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('Search listings error:', error)
    return NextResponse.json({ error: 'Failed to search listings' }, { status: 500 })
  }
}

// POST /api/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createListingSchema.parse(body)

    // Get user's active location
    const location = await prisma.location.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { type: 'asc' }, // Prefer home over traveler
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Please set your location first' },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        locationId: location.id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        condition: data.condition,
        isService: data.isService,
        wantsType: data.wantsType,
        wantsCategories: data.wantsCategories || [],
        wantsDescription: data.wantsDescription,
        availability: data.availability,
        preferredMeetupArea: data.preferredMeetupArea,
        status: 'draft', // Start as draft until photos added
      },
      include: {
        location: true,
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Create listing error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
