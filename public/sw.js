const CACHE_NAME = 'opporjob-cache-v7'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  // Only cache http/https requests
  if (!url.protocol.startsWith('http')) return
  // Skip supabase API requests to prevent caching stale database data
  if (url.hostname.includes('supabase.co')) return

  // Network-first approach with cache fallback for offline capability
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Do not cache error responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})

// Push event listener for Push Notifications
self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json()
      const options = {
        body: data.body || 'Você tem uma nova notificação.',
        icon: '/og-image.png',
        badge: '/og-image.png',
        data: {
          url: data.url || '/',
        },
      }
      event.waitUntil(
        self.registration.showNotification(data.title || 'OPPORJOB', options),
      )
    } catch (e) {
      console.error('Error parsing push data', e)
    }
  }
})

// Notification click listener
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const urlToOpen = new URL(
    event.notification.data.url || '/',
    self.location.origin,
  ).href

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        let matchingClient = null
        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i]
          if (windowClient.url === urlToOpen) {
            matchingClient = windowClient
            break
          }
        }
        if (matchingClient) {
          return matchingClient.focus()
        } else {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})
