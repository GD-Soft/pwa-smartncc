const firebaseConfig = {
  apiKey: 'AIzaSyBelyI2xlDDWVbTvCdpmOG0zfY314c9OIY',
  authDomain: 'app-smartncc-firebase.firebaseapp.com',
  projectId: 'app-smartncc-firebase',
  storageBucket: 'app-smartncc-firebase.firebasestorage.app',
  messagingSenderId: '274997008741',
  appId: '1:274997008741:web:7ebb8301a727c71aeca98c'
};

let swRegistration;
let messaging;
let deferredPrompt;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function loadIframe() {
  document.getElementById('app-frame').src = 'https://demo2018.ncconline.it/catalogo_noleggio/dashboard.aspx';
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service worker not supported');
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('sw.js');
    console.log('Service worker registered', reg);
    swRegistration = reg;
    return reg;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

function initFirebase(reg) {
  if (!reg) return;
  if (!messaging) {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    messaging.useServiceWorker(reg);
    messaging.onMessage(payload => {
      console.log('Message received', payload);
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
    Notification.requestPermission().then(result => {
      if (result === 'granted') {
        subscribeUser(reg);
      }
    });
  }
}

function subscribeUser(reg) {
  messaging.getToken({
    vapidKey: 'BPr90IboFD-spPXW40tyJuOHPUc1xJNnnPdedqDSQafITPfS7gJJ1-yeIzf9NcaHRoleyY2HGDUEgSF14b5D2rI',
    serviceWorkerRegistration: reg
  }).then(currentToken => {
    if (currentToken) {
      console.log('FCM token:', currentToken);
    } else {
      console.warn('No registration token available');
    }
  }).catch(err => {
    console.error('An error occurred while retrieving token', err);
  });
}

function setupInstallPrompt(banner, button, message) {
  if (isIos()) {
    message.textContent = "Per installare SmartNCC apri il menu 'Condividi' e seleziona 'Aggiungi a Home'.";
    button.textContent = 'Continua';
    banner.classList.remove('hidden');
  } else {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      banner.classList.remove('hidden');
    });
  }

  button.addEventListener('click', async () => {
    banner.classList.add('hidden');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        loadIframe();
      }
      deferredPrompt = null;
    } else {
      loadIframe();
    }
  });

  window.addEventListener('appinstalled', () => {
    loadIframe();
    if (swRegistration) initFirebase(swRegistration);
  });
}

async function init() {
  const banner = document.getElementById('install-banner');
  const btn = document.getElementById('install-button');
  const msg = document.getElementById('install-message');

  const reg = await registerServiceWorker();

  if (isStandalone()) {
    loadIframe();
    initFirebase(reg);
    return;
  }

  setupInstallPrompt(banner, btn, msg);
}

document.addEventListener('DOMContentLoaded', init);
