// Uni EduPulse Service Worker v18 (Web Push + System Notification Bar)
const CACHE_NAME = 'uni-v18-webpush';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  './components/map_v2.js',
  './components/alerts.js',
  './components/schedule.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ==========================================
// WEB PUSH HANDLER - This is what creates
// REAL Android system bar notifications!
// ==========================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received!');

  let data = {
    title: '🚨 Uni Lecture Alert',
    body: 'Upcoming class starting soon!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [400, 150, 400, 150, 600],
    tag: 'uni-push-' + Date.now(),
    renotify: true,
    requireInteraction: true
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
      if (payload.icon) data.icon = payload.icon;
      if (payload.badge) data.badge = payload.badge;
      if (payload.vibrate) data.vibrate = payload.vibrate;
      if (payload.tag) data.tag = payload.tag;
      if (payload.renotify !== undefined) data.renotify = payload.renotify;
      if (payload.requireInteraction !== undefined) data.requireInteraction = payload.requireInteraction;
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate,
    tag: data.tag,
    renotify: data.renotify,
    requireInteraction: data.requireInteraction,
    actions: [
      { action: 'open', title: '📍 Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      // Otherwise open new window
      return clients.openWindow('./');
    })
  );
});

// Handle message from app (fallback for non-push scenarios)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    const title = event.data.title || '🚨 Uni Lecture Alert';
    const body = event.data.body || 'Upcoming class starting!';

    self.registration.showNotification(title, {
      body: body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [400, 150, 400, 150, 600],
      tag: 'uni-msg-' + Date.now(),
      renotify: true,
      requireInteraction: true
    });
  }
});

// Cache strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return res;
    }).catch(() => caches.match(event.request))
  );
});
