# SmartNCC PWA

This project is a minimal Progressive Web App that embeds the SmartNCC dashboard in an iframe.
It can be served from any HTTPS web server.

## Usage

1. Serve the contents of this repository over HTTPS.
2. Open `index.html` on a compatible browser.
3. On supported platforms you will be prompted to install the app.
4. On iOS, tap the share icon in Safari and choose **Add to Home Screen** to install.

After the installation prompt is accepted (or the banner dismissed on iOS) the dashboard
is loaded inside the iframe.

## Notes

- Push notifications require user permission and a compatible service worker environment.
- If permission isn't granted, a banner with an **Abilita notifiche push** button appears above the app to request it again.
- iOS Safari does not support the `beforeinstallprompt` event, so a custom banner explains
  how to add the app to the home screen.
- Ensure the site is served via HTTPS for full functionality.

  The manifest refers to a set of icon PNGs that are not stored in the
  repository. Upload files at 48x48, 72x72, 96x96, 144x144, 192x192 and
  512x512 pixels to the web server so Android can display them in the home
  screen and in notifications.
