const CACHE_NAME = 'smartncc-cache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', event => {
  let data = { title: 'SmartNCC', body: 'Push message received.' };
  if (event.data) {
    data = event.data.json();
  }
  const options = {
    body: data.body,
    icon: "https://cdn.example.com/smartncc/icon-192.png",
    badge: "https://cdn.example.com/smartncc/icon-192.png",
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
