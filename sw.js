// Version: 1.0.4
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
//importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

self.addEventListener('push', event => {
    // 1) Decodifica in modo robusto il JSON del push  
    let payload = {};
    try {
        const raw = event.data.json();
        // FCM v1: payload.message.data, FCM v0: payload.data
        if (raw.message && raw.message.data) payload = raw.message.data;
        else if (raw.data) payload = raw.data;
        else payload = raw;
    } catch (e) {
        console.warn('Push payload non-JSON', e);
    }

    const title = payload.title || 'SmartNCC';
    const body = payload.body || '';
    const url = payload.url;
    const options = {
        body,
        icon: '/pwa-smartncc/icon-512.png',
        badge: '/pwa-smartncc/icon-96-monochrome.png',
        tag: 'smartncc-notification' // evita duplicati
    };
    if (url) options.data = { url };

    // 2) Usa waitUntil per non far partire la "site updated in background"
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

const firebaseConfig = {
  apiKey: 'AIzaSyBelyI2xlDDWVbTvCdpmOG0zfY314c9OIY',
  authDomain: 'app-smartncc-firebase.firebaseapp.com',
  projectId: 'app-smartncc-firebase',
  storageBucket: 'app-smartncc-firebase.appspot.com',
  messagingSenderId: '274997008741',
  appId: '1:274997008741:web:7ebb8301a727c71aeca98c'
};

firebase.initializeApp(firebaseConfig);
//const messaging = firebase.messaging();

const CACHE_NAME = 'smartncc-cache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',
  './icon-96-monochrome.png',
  './icon-192.png',
  './icon-512.png',
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
  const url = event.notification.data && event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url || '/pwa-smartncc/');
      }
    })
  );
});
