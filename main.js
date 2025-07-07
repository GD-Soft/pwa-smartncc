let deferredPrompt;
let swRegistration;
let messaging;

const firebaseConfig = {
  apiKey: 'AIzaSyBelyI2xlDDWVbTvCdpmOG0zfY314c9OIY',
  authDomain: 'app-smartncc-firebase.firebaseapp.com',
  projectId: 'app-smartncc-firebase',
  storageBucket: 'app-smartncc-firebase.firebasestorage.app',
  messagingSenderId: '274997008741',
  appId: '1:274997008741:web:7ebb8301a727c71aeca98c'
};



if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
      console.log('Service worker registered.', reg);
      swRegistration = reg;
      if (isStandalone()) {
        initPush(reg);
      }
    }).catch(function(err) {
      console.error('Service worker registration failed:', err);
    });
  });
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function loadIframe() {
  document.getElementById('app-frame').src = 'https://demo2018.ncconline.it/catalogo_noleggio/dashboard.aspx';
}

window.addEventListener('DOMContentLoaded', function() {
  const banner = document.getElementById('install-banner');
  const btn = document.getElementById('install-button');

  if (isStandalone()) {
    loadIframe();
  }

  window.addEventListener('beforeinstallprompt', function(e) {
    if (isStandalone()) return;
    e.preventDefault();
    deferredPrompt = e;
    banner.classList.remove('hidden');
  });

  btn.addEventListener('click', function() {
    banner.classList.add('hidden');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
          loadIframe();
        }
        deferredPrompt = null;
      });
    }
  });

  window.addEventListener('appinstalled', function() {
    loadIframe();
    if (swRegistration) {
      initPush(swRegistration);
    }
  });
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

function initPush(reg) {
  if (!('PushManager' in window)) {
    console.warn('Push messaging not supported');
    return;
  }

  if (!messaging) {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    messaging.useServiceWorker(reg);

    messaging.onMessage(function(payload) {
      console.log('Message received. ', payload);
      if (payload.notification) {
        const title = payload.notification.title || 'SmartNCC';
        const options = {
          body: payload.notification.body,
          icon: 'https://demo2018prod.smartncc.it/pwa-smartncc/icon-192.png'
        };
        new Notification(title, options);
      }
    });
  }

  if (Notification.permission === 'granted') {
    subscribeUser(reg);
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(function(result) {
      if (result === 'granted') {
        subscribeUser(reg);
      } else {
        console.warn('Permission not granted for notifications');
      }
    });
  } else {
    console.warn('Notification permission denied or blocked');
  }
}

function subscribeUser(reg) {
  messaging.getToken({
    vapidKey: 'BPr90IboFD-spPXW40tyJuOHPUc1xJNnnPdedqDSQafITPfS7gJJ1-yeIzf9NcaHRoleyY2HGDUEgSF14b5D2rI',
    serviceWorkerRegistration: reg
  }).then(function(currentToken) {
    if (currentToken) {
      console.log('FCM token:', currentToken);
      // TODO: Send token to app server
    } else {
      console.warn('No registration token available');
    }
  }).catch(function(err) {
    console.error('An error occurred while retrieving token. ', err);
  });
}
