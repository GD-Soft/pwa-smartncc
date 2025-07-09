// File: /pwa-smartncc/index.js
let deferredPrompt;
const installBtn = document.getElementById('install-btn');
const openBtn = document.getElementById('open-btn');
const instructions = document.getElementById('instructions');


const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

async function checkInstalled() {
    if (isInStandaloneMode() || hasInstalledFlag()) return true;
    if ('getInstalledRelatedApps' in navigator) {
        const apps = await navigator.getInstalledRelatedApps();
        return apps.some(a => a.platform === 'webapp');
    }
    return hasInstalledFlag();
}

function showOpenButton() {
    installBtn.classList.add('hidden');
    instructions.classList.add('hidden');
    openBtn.classList.remove('hidden');
    try {
        localStorage.setItem('pwa_installed', '1');
    } catch (e) {}
    openBtn.onclick = () => {
        // try opening via custom protocol first
        window.location.href = 'web+sncc:open';
        // fallback to regular URL if protocol not handled
        setTimeout(() => {
            window.location.href = '/pwa-smartncc/main.html';
        }, 500);
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
    if (hasInstalledFlag() || await checkInstalled()) {
        showOpenButton();
        return;
    }

    if (isIos()) {
        instructions.classList.remove('hidden');
        instructions.innerHTML =
            'Premi il pulsante <strong>Condividi <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2l4 4h-3v7h-2V6H8l4-4z"/><path d="M5 10v10h14V10h2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10h2z"/></svg></strong> e poi <strong>Aggiungi alla schermata Home</strong>.';
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
