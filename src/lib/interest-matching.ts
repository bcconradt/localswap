import { prisma } from './db'
import { ListingCategory } from '@/generated/prisma'
import {
  notifyNewListingMatch,
  shouldReceiveImmediateInterestNotification,
  shouldReceiveDigestInterestNotification,
} from './notifications'

// Check if two users have blocked each other
async function areUsersBlocked(userId1: string, userId2: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId1, blockedId: userId2 },
        { blockerId: userId2, blockedId: userId1 },
      ],
    },
  })
  return !!block
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Notify users interested in a newly active listing
export async function notifyInterestedUsers(listingId: string): Promise<{
  immediate: number
  queued: number
  skipped: number
}> {
  // Get the listing with its location
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      location: true,
      user: {
        select: { id: true },
      },
    },
  })

  if (!listing || listing.status !== 'active') {
    return { immediate: 0, queued: 0, skipped: 0 }
  }

  // Find all users interested in this category
  const interests = await prisma.userInterest.findMany({
    where: {
      category: listing.category,
      userId: { not: listing.userId }, // Don't notify the listing owner
    },
    include: {
      user: {
        include: {
          locations: {
            where: { isActive: true },
          },
        },
      },
    },
  })

  let immediate = 0
  let queued = 0
  let skipped = 0

  for (const interest of interests) {
    const user = interest.user

    // Check if users have blocked each other
    const blocked = await areUsersBlocked(user.id, listing.userId)
    if (blocked) {
      skipped++
      continue
    }

    // Check distance if location matching is required
    const userLocation = user.locations[0]
    if (userLocation && listing.location) {
      const radiusMiles = interest.radiusMiles
        ? Number(interest.radiusMiles)
        : Number(userLocation.radiusMiles)

      const distance = calculateDistance(
        Number(userLocation.latitude),
        Number(userLocation.longitude),
        Number(listing.location.latitude),
        Number(listing.location.longitude)
      )

      if (distance > radiusMiles) {
        skipped++
        continue
      }
    }

    // Check if user matches keywords (if specified)
    if (interest.keywords && interest.keywords.length > 0) {
      const listingText = `${listing.title} ${listing.description || ''}`.toLowerCase()
      const matchesKeyword = interest.keywords.some((keyword) =>
        listingText.includes(keyword.toLowerCase())
      )
      if (!matchesKeyword) {
        skipped++
        continue
      }
    }

    // Determine delivery method based on user settings
    const shouldSendImmediate = await shouldReceiveImmediateInterestNotification(user.id)
    const shouldQueueDigest = await shouldReceiveDigestInterestNotification(user.id)

    if (shouldSendImmediate) {
      await notifyNewListingMatch(
        user.id,
        listing.title,
        listing.category,
        listing.id
      )
      immediate++
    } else if (shouldQueueDigest) {
      // Queue for daily digest
      await prisma.pendingInterestMatch.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          category: listing.category,
        },
      })
      queued++
    } else {
      skipped++
    }
  }

  return { immediate, queued, skipped }
}

// Process pending interest matches and send digest notifications
export async function sendInterestDigests(): Promise<{
  usersNotified: number
  matchesProcessed: number
}> {
  // Get all unprocessed matches grouped by user
  const pendingMatches = await prisma.pendingInterestMatch.findMany({
    where: { processed: false },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by user
  const matchesByUser = new Map<string, typeof pendingMatches>()
  for (const match of pendingMatches) {
    const existing = matchesByUser.get(match.userId) || []
    existing.push(match)
    matchesByUser.set(match.userId, existing)
  }

  let usersNotified = 0
  let matchesProcessed = 0

  for (const [userId, userMatches] of matchesByUser) {
    // Filter out matches for listings that are no longer active
    const activeMatches = userMatches.filter(
      (m) => m.listing.status === 'active'
    )

    if (activeMatches.length === 0) {
      // Mark all as processed even if none are active
      await prisma.pendingInterestMatch.updateMany({
        where: { id: { in: userMatches.map((m) => m.id) } },
        data: { processed: true },
      })
      matchesProcessed += userMatches.length
      continue
    }

    // Create a digest notification
    if (activeMatches.length === 1) {
      const match = activeMatches[0]
      await notifyNewListingMatch(
        userId,
        match.listing.title,
        match.listing.category,
        match.listing.id
      )
    } else {
      // Multiple matches - create summary notification
      const categories = [...new Set(activeMatches.map((m) => m.listing.category))]
      const categoryText = categories.slice(0, 3).join(', ')
      const body =
        activeMatches.length <= 3
          ? `Check out these new listings: ${activeMatches.map((m) => `"${m.listing.title}"`).join(', ')}`
          : `${activeMatches.length} new listings match your interests in ${categoryText}`

      await prisma.notification.create({
        data: {
          userId,
          type: 'new_listing_match',
          title: 'New Listings Match Your Interests',
          body,
          metadata: {
            listingIds: activeMatches.map((m) => m.listingId),
            categories,
            count: activeMatches.length,
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Mark all user's matches as processed
    await prisma.pendingInterestMatch.updateMany({
      where: { id: { in: userMatches.map((m) => m.id) } },
      data: { processed: true },
    })

    usersNotified++
    matchesProcessed += userMatches.length
  }

  return { usersNotified, matchesProcessed }
}

// Get user interests with category labels
export async function getUserInterests(userId: string) {
  return prisma.userInterest.findMany({
    where: { userId },
    orderBy: { category: 'asc' },
  })
}

// Add a new interest for a user
export async function addInterest(
  userId: string,
  category: ListingCategory,
  options?: { keywords?: string[]; radiusMiles?: number }
) {
  return prisma.userInterest.upsert({
    where: {
      userId_category: { userId, category },
    },
    create: {
      userId,
      category,
      keywords: options?.keywords || [],
      radiusMiles: options?.radiusMiles,
    },
    update: {
      keywords: options?.keywords || [],
      radiusMiles: options?.radiusMiles,
    },
  })
}

// Remove an interest
export async function removeInterest(userId: string, interestId: string) {
  const result = await prisma.userInterest.deleteMany({
    where: {
      id: interestId,
      userId,
    },
  })
  return result.count > 0
}

// Bulk replace all interests for a user
export async function replaceInterests(
  userId: string,
  interests: Array<{
    category: ListingCategory
    keywords?: string[]
    radiusMiles?: number
  }>
) {
  // Delete existing interests
  await prisma.userInterest.deleteMany({
    where: { userId },
  })

  // Create new interests
  if (interests.length > 0) {
    await prisma.userInterest.createMany({
      data: interests.map((i) => ({
        userId,
        category: i.category,
        keywords: i.keywords || [],
        radiusMiles: i.radiusMiles,
      })),
    })
  }

  return getUserInterests(userId)
}
