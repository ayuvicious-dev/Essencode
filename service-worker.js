const CACHE = 'essencode-v1';
const SHELL = [
  './', './index.html', './manifest.json',
  './icons/icon-96.png', './icons/icon-192.png', './icons/icon-512.png',
  './icons/favicon.png', './icons/apple-touch-icon.png'
];
const CDN_HOSTS = ['www.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Halaman: network-first, fallback ke cache (agar update index.html langsung terlihat)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => { caches.open(CACHE).then(c => c.put('./index.html', res.clone())); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // File statis milik sendiri & library CDN: stale-while-revalidate
  if (url.origin === location.origin || CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
  // Firestore/Auth (googleapis.com) tidak disentuh service worker.
});
