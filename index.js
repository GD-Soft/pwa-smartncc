// File: /pwa-smartncc/index.js
let deferredPrompt;
const installBtn = document.getElementById('install-btn');
const openBtn = document.getElementById('open-btn');
const instructions = document.getElementById('instructions');

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

// Se già in modalità standalone, mostra Apri
if (isInStandaloneMode()) {
    openBtn.classList.remove('hidden');
    openBtn.onclick = () =>
        window.location.href = '/pwa-smartncc/main.html';
} else {
    if (isIos()) {
        // iOS: istruzioni manuali
        instructions.classList.remove('hidden');
        instructions.innerHTML =
            'Premi il pulsante <strong>Condividi</strong> e seleziona <strong>Aggiungi alla schermata Home</strong>.';
    } else {
        // Android/altro: gestisci beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.classList.remove('hidden');
        });

        installBtn.onclick = async () => {
            installBtn.disabled = true;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('Installazione accettata');
            }
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        };
    }
}

// Fallback con getInstalledRelatedApps
if ('getInstalledRelatedApps' in navigator) {
    navigator.getInstalledRelatedApps().then(apps => {
        if (apps.some(a => a.platform === 'webapp')) {
            installBtn.classList.add('hidden');
            openBtn.classList.remove('hidden');
            openBtn.onclick = () =>
                window.location.href = '/pwa-smartncc/main.html';
        }
    });
}
