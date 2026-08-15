/* Elmo3tarf React Service Worker v3.0 */
const CACHE = 'elmo3tarf-react-v3';
const STATIC = ['/', './index.html', './images/logo.png', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(STATIC).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (e.request.method !== 'GET') return;
  if (url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic') || url.includes('cloudinary') || url.includes('fonts.g')) return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

// ===== Web Push =====
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: 'Elmo3tarf', body: e.data ? e.data.text() : '' }; }
  const title = data.title || 'Elmo3tarf - المعترف';
  const options = {
    body: data.body || '',
    icon: 'https://res.cloudinary.com/w635mvns/image/upload/v1785542698/myi7pnercgigghiav7rq.png',
    badge: 'images/logo.png',
    data: { url: data.url || './', orderId: data.orderId || null },
    vibrate: [120, 60, 120]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ===== الضغط على النوتيفيكيشن =====
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  const url = data.url || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) { client.navigate(url); return client.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
