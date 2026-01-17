// LocalSwap Service Worker
const CACHE_NAME = 'localswap-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API requests - always go to network
  if (url.pathname.startsWith('/api/')) return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  event.respondWith(
    (async () => {
      // Try cache first for static assets
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(updateCache(request))
        return cachedResponse
      }

      // Try network
      try {
        const networkResponse = await fetch(request)

        // Cache successful responses for static assets
        if (networkResponse.ok && shouldCache(request)) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, networkResponse.clone())
        }

        return networkResponse
      } catch (error) {
        // Network failed - serve offline page for navigation requests
        if (request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL)
          if (offlineResponse) return offlineResponse
        }

        // For other requests, just throw
        throw error
      }
    })()
  )
})

// Helper to update cache in background
async function updateCache(request) {
  try {
    const response = await fetch(request)
    if (response.ok && shouldCache(request)) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response)
    }
  } catch (error) {
    // Silently fail - we have the cached version
  }
}

// Determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url)

  // Cache same-origin requests only
  if (url.origin !== self.location.origin) return false

  // Cache static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2']
  if (staticExtensions.some((ext) => url.pathname.endsWith(ext))) return true

  // Cache page navigations
  if (request.mode === 'navigate') return true

  return false
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'LocalSwap', options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

console.log('[SW] Service Worker loaded')
