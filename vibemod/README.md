# VibeMod

Original short-video Android app for **your own** media. Local-first player with Mod Center customization — **not** a patched or repackaged TikTok APK, and not affiliated with TikTok/ByteDance.

## Download the APK
→ **https://github.com/r4faelllaust/R4Fix/releases** → `VibeMod-android-debug.apk`  
(or Actions artifact **VibeMod-android-debug** — see [DOWNLOAD.md](../DOWNLOAD.md))

## Features

- Vertical swipe feed (Media3 / ExoPlayer)
- Import videos via Android Photo Picker
- Discover: local search, filters, categories, recent searches
- Profile with editable local username/bio/avatar and decorative badges
- Mod Center: appearance, playback, feed, privacy (PIN), accessibility, gestures, badges, advanced
- Library: import / favorite / collection / remove
- Settings: export/import preferences JSON, reset, privacy & about

## Requirements

- Android Studio Ladybug+ or JDK 17
- Android SDK 35, Build-Tools 34+
- Device or emulator: **Android 8.0 (API 26)+**

## Build

```bash
cd vibemod
# Ensure local.properties contains sdk.dir=/path/to/Android/Sdk
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
```

Debug APK output:

```text
app/build/outputs/apk/debug/app-debug.apk
```

Release (unsigned unless you configure signing):

```bash
./gradlew :app:assembleRelease
```

## Emulator testing (Windows PC)

See **[EMULATOR_WINDOWS.md](EMULATOR_WINDOWS.md)** for Galaxy S24–like AVD setup, `adb install`, instrumented tests, and importing demo videos. Prefer testing on the emulator before installing on a physical phone.

Scripts (Linux/macOS agents / WSL):

- `scripts/emulator-s24.sh` — boot AVD, install APK, launch
- `scripts/push-demo-videos.sh` — push MP4s into the emulator
- `scripts/capture-emulator-evidence.sh` — screencap + logcat

## Windows desktop app

A Compose Desktop companion lives in `../vibemod-desktop/` (feed, library import, Mod Center, badges). Download Windows EXE/MSI from GitHub Actions workflow **Build VibeMod Desktop**.

## Install on a Samsung Galaxy S24 (or any Android phone)

1. On the phone: **Settings → Security** (or **Biometrics and security**) → enable **Install unknown apps** for the app you will use (Files, Chrome, etc.).
2. Copy `app-debug.apk` to the phone (USB, Drive, or GitHub release download).
3. Open the APK on the phone and install.
4. Launch **VibeMod**. Grant media access only if/when importing local videos.

Via USB debugging:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Debug builds use application id `com.example.vibemod.debug`.

## Architecture

- Kotlin · Jetpack Compose · Material 3 · MVVM · Hilt · StateFlow
- Room (library metadata) · DataStore (preferences / profile / search history)
- `VideoRepository` interface for future authorized providers

Branding knobs live in `Branding.kt` (`APP_NAME`, tagline, about text).

## Privacy defaults

- No accounts, no analytics SDKs, no credential capture
- PIN stored as SHA-256 hash on device
- Backup rules exclude app data from cloud backup
- Demo catalog uses clearly labeled public sample streams; disable in Mod Center

## Tests

```bash
./gradlew :app:testDebugUnitTest
# Instrumented (device/emulator required):
./gradlew :app:connectedDebugAndroidTest
```

## Unsupported in v1

- Live social feed, comments, likes, DMs, or remote verification
- Any TikTok API / scraping / signature bypass
