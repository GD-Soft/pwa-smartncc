// Version: 1.0.0
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBelyI2xlDDWVbTvCdpmOG0zfY314c9OIY',
  authDomain: 'app-smartncc-firebase.firebaseapp.com',
  projectId: 'app-smartncc-firebase',
  storageBucket: 'app-smartncc-firebase.firebasestorage.app',
  messagingSenderId: '274997008741',
  appId: '1:274997008741:web:7ebb8301a727c71aeca98c'
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const CACHE_NAME = 'smartncc-cache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './installed.html',
  './manifest.json',
  './icon-96bn.png',
  './icon-192.png',
  './icon-512c.png',
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


self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/pwa-smartncc/');
      }
    })
  );
});

messaging.onBackgroundMessage(payload => {
  if (payload.notification) {
    // Firebase will display the notification automatically
    return;
  }

  const notificationTitle =
    (payload.data && payload.data.title) ||
    'SmartNCC';
  const notificationBody =
    (payload.data && payload.data.body) ||
    '';
  const options = {
    body: notificationBody,
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };
  self.registration.showNotification(notificationTitle, options);
});

