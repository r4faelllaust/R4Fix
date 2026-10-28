# Test VibeMod on Windows (Android Emulator) before your Galaxy S24

This cloud agent created AVD profile **VibeMod_S24** (1080×2340, Android 14 / API 34) and built the debug APK, but **nested KVM in the cloud VM could not finish booting the guest** (adb stayed `offline`). Run the emulator on your Windows PC instead — do **not** install on the Samsung yet if you want to try the virtual phone first.

## 1. Install tooling on Windows

1. Install [Android Studio](https://developer.android.com/studio) (Ladybug or newer).
2. Open **SDK Manager** → install:
   - Android SDK Platform 34 (and/or 35)
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM) **or** use Windows Hypervisor Platform / WHPX
3. Enable virtualization in BIOS if prompted.

## 2. Create an S24-like virtual device

In **Device Manager** → **Create Device**:

| Setting | Suggested value |
|--------|------------------|
| Device | Pixel 7 / Phone definition, then edit |
| Resolution | 1080 × 2340 |
| Density | ~450 dpi |
| System image | API 34 Google APIs x86_64 (or Google Play) |
| RAM | 3 GB+ |

Name it e.g. `VibeMod_S24`.

## 3. Build & install

From a terminal in the repo:

```bat
cd vibemod
gradlew.bat assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.example.vibemod.debug/com.example.vibemod.MainActivity
```

Or use Android Studio: open `vibemod/`, Run on the AVD.

Or download the APK from GitHub Actions artifact **VibeMod-debug** / PR build output.

## 4. Automated tests on the emulator

```bat
cd vibemod
gradlew.bat connectedDebugAndroidTest
```

Covers startup, bottom navigation, profile badges, Mod Center themes, settings.

## 5. Import demo / your own videos into the emulator

**Option A — built-in demo streams (easiest)**  
Mod Center → enable **Show demo videos** (needs emulator network).

**Option B — push local MP4s**

```bat
adb push myclip.mp4 /sdcard/Movies/VibeMod/
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Movies/VibeMod/myclip.mp4
```

Then in VibeMod: **Library → +** and pick the file from Photos/Files.

**Option C — drag & drop** into the emulator window (Extended Controls → Files).

## 6. Keep the emulator open

Leave the AVD running so you can swipe the feed, change badges, and tweak Mod Center yourself before sideloading onto the S24.

## Galaxy S24 install (later)

Only when you are ready: copy `app-debug.apk` to the phone (USB/Drive), allow unknown apps for that installer, install. Application id: `com.example.vibemod.debug`.
