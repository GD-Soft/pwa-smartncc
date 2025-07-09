// File: /pwa-smartncc/index.js
let deferredPrompt;
const installBtn = document.getElementById('install-btn');
const openBtn = document.getElementById('open-btn');
const instructions = document.getElementById('instructions');
const iosHint = document.getElementById('ios-hint');

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

async function checkInstalled() {
    if (isInStandaloneMode()) return true;
    if ('getInstalledRelatedApps' in navigator) {
        const apps = await navigator.getInstalledRelatedApps();
        return apps.some(a => a.platform === 'webapp');
    }
    return false;
}

function showOpenButton() {
    installBtn.classList.add('hidden');
    instructions.classList.add('hidden');
    iosHint.classList.add('hidden');
    openBtn.classList.remove('hidden');
    openBtn.onclick = () => {
        window.location.href = '/pwa-smartncc/main.html';
    };
}

let pollId;
function startInstallPolling() {
    if (pollId) return;
    pollId = setInterval(async () => {
        if (await checkInstalled()) {
            clearInterval(pollId);
            showOpenButton();
        }
    }, 3000);
}

window.addEventListener('appinstalled', () => {
    clearInterval(pollId);
    showOpenButton();
});

async function init() {
    if (await checkInstalled()) {
        showOpenButton();
        return;
    }

    if (isIos()) {
        instructions.classList.remove('hidden');
        instructions.innerHTML =
            'Premi il pulsante <strong>Condividi</strong> e poi <strong>Aggiungi alla schermata Home</strong>.';
        iosHint.classList.remove('hidden');
        startInstallPolling();
    } else {
        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.classList.remove('hidden');
        });

        installBtn.addEventListener('click', async () => {
            installBtn.disabled = true;
            instructions.classList.remove('hidden');
            instructions.textContent =
                'Grazie! L\'installazione proceder\u00e0 in background. Troverai l\'icona sul telefonino al termine.';
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt = null;
            }
            startInstallPolling();
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
