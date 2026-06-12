---
name: android-packaging
description: Turn the GuardNG React/Vite app into an installable Android app using Capacitor — project setup, native plugins (geolocation, camera, push, SMS dial), PWA fallback, build/sign/release commands. Use when setting up or modifying anything Android/native related.
---

# Android packaging (Capacitor)

Strategy decision (made deliberately for this codebase): **keep the React +
Vite + Firebase code and wrap it with Capacitor**. A React Native/Flutter
rewrite throws away a working app; a plain PWA can't reliably deliver push
notifications, background sync, or a Play Store presence in Nigeria where
users expect an APK. Capacitor gives a real APK with native APIs while the
web build remains deployable to Firebase Hosting as the PWA fallback.

## One-time setup

```bash
npm i @capacitor/core @capacitor/android
npm i -D @capacitor/cli
npx cap init "GuardNG" "ng.guardng.app" --web-dir=dist
npx cap add android
```

`capacitor.config.ts` essentials:

```ts
const config: CapacitorConfig = {
  appId: 'ng.guardng.app',
  appName: 'GuardNG',
  webDir: 'dist',
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { backgroundColor: '#FFFFFF', launchShowDuration: 1500 },
  },
};
```

## Native plugins to use (and what they replace)

| Need | Plugin | Replaces |
|---|---|---|
| GPS for reports/SOS | `@capacitor/geolocation` | `navigator.geolocation` (keep web fallback) |
| Photo capture | `@capacitor/camera` | `<input capture>` (keep web fallback) |
| Push alerts | `@capacitor/push-notifications` + FCM | nothing (new) |
| Offline detection | `@capacitor/network` | `navigator.onLine` |
| Emergency dial | plain `window.open('tel:112')` | works in WebView, no plugin needed |
| Secure session | `@capacitor/preferences` | localStorage for auth persistence |

Wrap each in a small adapter (`services/native/`) that feature-detects
`Capacitor.isNativePlatform()` and falls back to the web API, so the same
bundle serves PWA and APK.

**Firebase Auth note**: in the WebView, `signInWithPopup`/redirect flows
break. The app uses email/password only — keep it that way, or add phone
auth via Firebase's native SDK if OTP login (per the designs' "Verify Your
Account" screen) is implemented.

## Android manifest additions

`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `CAMERA`,
`RECORD_AUDIO`, `POST_NOTIFICATIONS`, `INTERNET`. Request at point of use
with a pre-permission explainer sheet (low trust environment — explain WHY
before the OS dialog).

## Low-end device targets

- Support `minSdkVersion 23` (Android 6) — huge installed base of cheap
  devices in Nigeria. Test on a 1GB-RAM profile (Android Studio emulator,
  cold boot < 4s target).
- APK size budget: **≤ 12MB**. Use `bundleRelease` (AAB) for Play Store +
  a direct-download APK (many users sideload via Xender/SHAREit).
- Splash + app icon: green shield on white per designs
  (`npx @capacitor/assets generate`).

## Build & release loop

```bash
npm run build            # vite build → dist/
npx cap sync android     # copy web assets + plugin config
npx cap run android      # dev: install on device/emulator
cd android && ./gradlew assembleRelease   # APK
cd android && ./gradlew bundleRelease     # AAB for Play Store
```

Signing: generate keystore once (`keytool -genkey -v -keystore guardng.keystore
-alias guardng -keyalg RSA -keysize 2048 -validity 10000`), reference it in
`android/app/build.gradle` signingConfigs via env vars — never commit the
keystore or passwords.

## PWA fallback (ship alongside)

Add `vite-plugin-pwa`: precache the app shell, runtime-cache map tiles
(cache-first, 7-day expiry), `manifest.webmanifest` with green theme color
`#008751`, maskable icons. This serves users who won't install an APK and
enables Background Sync for the report outbox on the web.
