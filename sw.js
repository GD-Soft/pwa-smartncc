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
    icon: 'https://demo2018prod.smartncc.it/pwa-smartncc/icon-192.png',
    badge: 'https://demo2018prod.smartncc.it/pwa-smartncc/icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification && payload.notification.title ? payload.notification.title : 'SmartNCC';
  const notificationOptions = {
    body: payload.notification && payload.notification.body,
    icon: 'https://demo2018prod.smartncc.it/pwa-smartncc/icon-192.png',
    badge: 'https://demo2018prod.smartncc.it/pwa-smartncc/icon-192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
