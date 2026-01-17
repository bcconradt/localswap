import webpush from 'web-push'
import { prisma } from './db'

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@localswap.app'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  actions?: Array<{
    action: string
    title: string
  }>
}

// Send push notification to a specific user
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[Push] VAPID keys not configured, skipping push notification')
    return { success: 0, failed: 0 }
  }

  // Get all subscriptions for this user
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) {
    return { success: 0, failed: 0 }
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || '/',
            icon: payload.icon || '/icons/icon-192.png',
            badge: payload.badge || '/icons/favicon-32x32.png',
            actions: payload.actions,
          })
        )
        return { success: true, endpoint: sub.endpoint }
      } catch (error: unknown) {
        // Handle expired or invalid subscriptions
        const statusCode = (error as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired or unsubscribed, remove it
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          })
          console.log('[Push] Removed expired subscription:', sub.endpoint)
        }
        throw error
      }
    })
  )

  const success = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return { success, failed }
}

// Send push notification to multiple users
export async function sendPushNotificationToMany(
  userIds: string[],
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  const results = await Promise.all(
    userIds.map((userId) => sendPushNotification(userId, payload))
  )

  return results.reduce(
    (acc, r) => ({
      success: acc.success + r.success,
      failed: acc.failed + r.failed,
    }),
    { success: 0, failed: 0 }
  )
}

// Generate VAPID keys (run once to get keys)
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys()
}
