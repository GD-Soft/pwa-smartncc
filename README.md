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
- iOS Safari does not support the `beforeinstallprompt` event, so a custom banner explains
  how to add the app to the home screen.
- Ensure the site is served via HTTPS for full functionality.
