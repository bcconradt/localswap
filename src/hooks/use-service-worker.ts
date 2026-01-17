'use client'

import { useEffect, useState } from 'react'
import {
  registerServiceWorker,
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  getPushSubscription,
} from '@/lib/service-worker'

interface UseServiceWorkerReturn {
  isSupported: boolean
  isRegistered: boolean
  pushPermission: NotificationPermission | 'unsupported'
  isPushSubscribed: boolean
  requestPushPermission: () => Promise<boolean>
  subscribePush: () => Promise<boolean>
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [isRegistered, setIsRegistered] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isPushSubscribed, setIsPushSubscribed] = useState(false)

  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator

  useEffect(() => {
    if (!isSupported) return

    // Register service worker
    registerServiceWorker().then((registration) => {
      setIsRegistered(!!registration)
    })

    // Check notification permission
    setPushPermission(getNotificationPermission())

    // Check if already subscribed
    getPushSubscription().then((subscription) => {
      setIsPushSubscribed(!!subscription)
    })
  }, [isSupported])

  const requestPushPermission = async (): Promise<boolean> => {
    const permission = await requestNotificationPermission()
    setPushPermission(permission)
    return permission === 'granted'
  }

  const subscribePush = async (): Promise<boolean> => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.warn('[Push] VAPID key not configured')
      return false
    }

    const subscription = await subscribeToPush(vapidKey)
    if (subscription) {
      setIsPushSubscribed(true)

      // Send subscription to server
      try {
        await fetch('/api/notifications/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON()),
        })
        return true
      } catch (error) {
        console.error('[Push] Failed to save subscription:', error)
      }
    }

    return false
  }

  return {
    isSupported,
    isRegistered,
    pushPermission,
    isPushSubscribed,
    requestPushPermission,
    subscribePush,
  }
}
