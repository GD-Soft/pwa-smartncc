const firebaseConfig = {
  apiKey: 'AIzaSyBelyI2xlDDWVbTvCdpmOG0zfY314c9OIY',
  authDomain: 'app-smartncc-firebase.firebaseapp.com',
  projectId: 'app-smartncc-firebase',
  storageBucket: 'app-smartncc-firebase.appspot.com',
  messagingSenderId: '274997008741',
  appId: '1:274997008741:web:7ebb8301a727c71aeca98c'
};

let swRegistration;
let messaging;

function showInstallPage() {
  window.location.href = 'index.html';
}


function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
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

        messaging.onMessage(payload => {
            console.log('Message received', payload);
            if (!payload.notification) return;

            const title = payload.notification.title || 'SmartNCC';
            const body = payload.notification.body || '';
            const options = {
                body,
                icon: '/pwa-smartncc/icon-512.png',            // colorata
                badge: '/pwa-smartncc/icon-96-monochrome.png'   // B/N
            };

            // se lutente ha dato il permesso, mostra notifica nativa
            if (Notification.permission === 'granted') {
                new Notification(title, options);
            } else {
                // fallback in pagina
                alert(`${title}\n${body}`);
            }
        });
    }
    subscribeUser(reg);
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



async function init() {
  const notifyBanner = document.getElementById('notification-banner');
  const notifyBtn = document.getElementById('enable-notifications');

  const reg = await registerServiceWorker();

  if (!isStandalone()) {
    showInstallPage();
    return;
  }

  loadIframe();
  if (Notification.permission === 'granted') {
    initFirebase(reg);
  } else {
    notifyBanner.classList.remove('hidden');
    notifyBtn.addEventListener('click', () => {
      Notification.requestPermission().then(result => {
        if (result === 'granted') {
          notifyBanner.classList.add('hidden');
          initFirebase(reg);
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
