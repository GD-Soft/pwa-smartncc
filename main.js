if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
      console.log('Service worker registered.', reg);
      initPush(reg);
    }).catch(function(err) {
      console.error('Service worker registration failed:', err);
    });
  });
}

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

  Notification.requestPermission().then(function(result) {
    if (result !== 'granted') {
      console.warn('Permission not granted for notifications');
    } else {
      subscribeUser(reg);
    }
  });
}

function subscribeUser(reg) {
  const applicationServerKey = urlBase64ToUint8Array('BPr90IboFD-spPXW40tyJuOHPUc1xJNnnPdedqDSQafITPfS7gJJ1-yeIzf9NcaHRoleyY2HGDUEgSF14b5D2rI');
  reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }).then(function(subscription) {
    console.log('Push subscription:', JSON.stringify(subscription));
    // TODO: Send subscription to app server
  }).catch(function(err) {
    console.error('Failed to subscribe the user: ', err);
  });
}
