import { prisma } from './db'
import { NotificationType, InterestDelivery, Prisma } from '@/generated/prisma'
import { sendPushNotification } from './push'

// Quiet hours configuration type
interface QuietHours {
  enabled: boolean
  start: string // HH:MM format
  end: string   // HH:MM format
  timezone: string
}

// Notification creation options
interface CreateNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  body: string
  metadata?: Prisma.InputJsonValue
  relatedOfferId?: string
  relatedListingId?: string
}

// Check if current time is within quiet hours for a user
function isWithinQuietHours(quietHours: QuietHours | null): boolean {
  if (!quietHours?.enabled) return false

  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: quietHours.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const currentTime = formatter.format(now)
    const [currentHour, currentMinute] = currentTime.split(':').map(Number)
    const currentMinutes = currentHour * 60 + currentMinute

    const [startHour, startMinute] = quietHours.start.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute

    const [endHour, endMinute] = quietHours.end.split(':').map(Number)
    const endMinutes = endHour * 60 + endMinute

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  } catch {
    return false
  }
}

// Calculate when quiet hours end for scheduling delayed notifications
function getQuietHoursEndTime(quietHours: QuietHours): Date {
  const now = new Date()
  const [endHour, endMinute] = quietHours.end.split(':').map(Number)

  // Create a date in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: quietHours.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const dateParts = formatter.format(now).split('/')
  const [month, day, year] = dateParts.map(Number)

  // Create target date at quiet hours end time
  let targetDate = new Date(
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`
  )

  // If target time is in the past, add a day
  if (targetDate <= now) {
    targetDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
  }

  return targetDate
}

// Get or create notification settings for a user
export async function getOrCreateSettings(userId: string) {
  let settings = await prisma.notificationSettings.findUnique({
    where: { userId },
  })

  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: { userId },
    })
  }

  return settings
}

// Check if a notification type is enabled for a user
async function isNotificationEnabled(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const settings = await getOrCreateSettings(userId)

  if (!settings.globalEnabled) return false

  const typeToSettingMap: Record<NotificationType, keyof typeof settings> = {
    offer_received: 'offerReceived',
    offer_accepted: 'offerAccepted',
    offer_declined: 'offerDeclined',
    offer_countered: 'offerCountered',
    offer_expired: 'offerExpired',
    message_received: 'messageReceived',
    review_received: 'reviewReceived',
    trade_completed: 'tradeCompleted',
    new_listing_match: 'newListingMatch',
    daily_encouragement: 'dailyEncouragement',
  }

  const settingKey = typeToSettingMap[type]
  return settings[settingKey] as boolean
}

// Create a notification for a user
export async function createNotification(
  options: CreateNotificationOptions
): Promise<{ created: boolean; reason?: string; notificationId?: string }> {
  const { userId, type, title, body, metadata, relatedOfferId, relatedListingId } = options

  // Check if notification type is enabled
  const isEnabled = await isNotificationEnabled(userId, type)
  if (!isEnabled) {
    return { created: false, reason: 'notification_disabled' }
  }

  const settings = await getOrCreateSettings(userId)
  const quietHours = settings.quietHours as QuietHours | null

  // Calculate delivery time (for quiet hours support)
  let deliverAt: Date | null = null
  if (isWithinQuietHours(quietHours)) {
    deliverAt = getQuietHoursEndTime(quietHours!)
  }

  // Set expiration to 30 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      metadata: metadata ?? undefined,
      relatedOfferId,
      relatedListingId,
      deliverAt,
      expiresAt,
    },
  })

  // Send push notification if not within quiet hours
  if (!deliverAt) {
    // Fire and forget - don't block on push notification
    sendPushNotification(userId, {
      title,
      body,
      url: relatedOfferId ? `/inbox` : relatedListingId ? `/listings/${relatedListingId}` : '/',
    }).catch((err) => console.error('[Push] Failed to send:', err))
  }

  return { created: true, notificationId: notification.id }
}

// Get paginated notifications for a user
export async function getNotifications(
  userId: string,
  options: { limit?: number; cursor?: string; unreadOnly?: boolean } = {}
) {
  const { limit = 20, cursor, unreadOnly = false } = options

  const where = {
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
    // Only show notifications that should be delivered now
    OR: [
      { deliverAt: null },
      { deliverAt: { lte: new Date() } },
    ],
  }

  const notifications = await prisma.notification.findMany({
    where,
    take: limit + 1, // Fetch one extra to determine if there's more
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = notifications.length > limit
  if (hasMore) {
    notifications.pop()
  }

  return {
    notifications,
    nextCursor: hasMore ? notifications[notifications.length - 1].id : null,
  }
}

// Get unread notification count
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
      OR: [
        { deliverAt: null },
        { deliverAt: { lte: new Date() } },
      ],
    },
  })
}

// Mark a single notification as read
export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return result.count > 0
}

// Bulk mark notifications as read
export async function markManyAsRead(
  notificationIds: string[],
  userId: string
): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return result.count
}

// Mark all notifications as read
export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  })

  return result.count
}

// Delete notifications
export async function deleteNotifications(
  notificationIds: string[],
  userId: string
): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
  })

  return result.count
}

// Delete expired notifications (called by cron)
export async function deleteExpiredNotifications(): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })

  return result.count
}

// Helper functions for specific notification types

export async function notifyOfferReceived(
  listingOwnerId: string,
  offererName: string,
  listingTitle: string,
  offerId: string,
  listingId: string
) {
  return createNotification({
    userId: listingOwnerId,
    type: 'offer_received',
    title: 'New Offer Received',
    body: `${offererName} made an offer on your "${listingTitle}"`,
    relatedOfferId: offerId,
    relatedListingId: listingId,
    metadata: { offererName, listingTitle },
  })
}

export async function notifyOfferAccepted(
  offererId: string,
  ownerName: string,
  listingTitle: string,
  offerId: string,
  listingId: string
) {
  return createNotification({
    userId: offererId,
    type: 'offer_accepted',
    title: 'Offer Accepted!',
    body: `${ownerName} accepted your offer on "${listingTitle}"`,
    relatedOfferId: offerId,
    relatedListingId: listingId,
    metadata: { ownerName, listingTitle },
  })
}

export async function notifyOfferDeclined(
  offererId: string,
  ownerName: string,
  listingTitle: string,
  offerId: string,
  listingId: string
) {
  return createNotification({
    userId: offererId,
    type: 'offer_declined',
    title: 'Offer Declined',
    body: `${ownerName} declined your offer on "${listingTitle}"`,
    relatedOfferId: offerId,
    relatedListingId: listingId,
    metadata: { ownerName, listingTitle },
  })
}

export async function notifyOfferCountered(
  offererId: string,
  ownerName: string,
  listingTitle: string,
  offerId: string,
  listingId: string
) {
  return createNotification({
    userId: offererId,
    type: 'offer_countered',
    title: 'Counter Offer Received',
    body: `${ownerName} made a counter offer on "${listingTitle}"`,
    relatedOfferId: offerId,
    relatedListingId: listingId,
    metadata: { ownerName, listingTitle },
  })
}

export async function notifyMessageReceived(
  recipientId: string,
  senderName: string,
  messagePreview: string,
  offerId: string
) {
  return createNotification({
    userId: recipientId,
    type: 'message_received',
    title: 'New Message',
    body: `${senderName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
    relatedOfferId: offerId,
    metadata: { senderName, messagePreview },
  })
}

export async function notifyReviewReceived(
  userId: string,
  reviewerName: string,
  rating: number,
  offerId: string
) {
  return createNotification({
    userId,
    type: 'review_received',
    title: 'New Review',
    body: `${reviewerName} left you a ${rating}-star review`,
    relatedOfferId: offerId,
    metadata: { reviewerName, rating },
  })
}

export async function notifyTradeCompleted(
  userId: string,
  partnerName: string,
  listingTitle: string,
  offerId: string,
  listingId: string
) {
  return createNotification({
    userId,
    type: 'trade_completed',
    title: 'Trade Complete!',
    body: `Your swap with ${partnerName} for "${listingTitle}" is complete. Don't forget to leave a review!`,
    relatedOfferId: offerId,
    relatedListingId: listingId,
    metadata: { partnerName, listingTitle },
  })
}

export async function notifyNewListingMatch(
  userId: string,
  listingTitle: string,
  category: string,
  listingId: string
) {
  return createNotification({
    userId,
    type: 'new_listing_match',
    title: 'New Listing Match',
    body: `A new ${category} listing matches your interests: "${listingTitle}"`,
    relatedListingId: listingId,
    metadata: { listingTitle, category },
  })
}

export async function notifyDailyEncouragement(
  userId: string,
  quote: string,
  author?: string
) {
  return createNotification({
    userId,
    type: 'daily_encouragement',
    title: 'Daily Swap Inspiration',
    body: author ? `"${quote}" - ${author}` : quote,
    metadata: { quote, author },
  })
}

// Check if user should receive immediate interest notifications
export async function shouldReceiveImmediateInterestNotification(
  userId: string
): Promise<boolean> {
  const settings = await getOrCreateSettings(userId)
  return settings.newListingMatch && settings.interestDelivery === InterestDelivery.immediate
}

// Check if user should receive digest interest notifications
export async function shouldReceiveDigestInterestNotification(
  userId: string
): Promise<boolean> {
  const settings = await getOrCreateSettings(userId)
  return settings.newListingMatch && settings.interestDelivery === InterestDelivery.daily_digest
}
