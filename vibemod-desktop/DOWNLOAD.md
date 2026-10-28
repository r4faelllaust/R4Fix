# Download VibeMod on your laptop (Windows)

## Option A — GitHub Actions artifact (easiest once CI is green)

1. Open: https://github.com/r4faelllaust/R4Fix/actions/workflows/build-desktop-windows.yml
2. Click the latest **successful** run on branch `cursor/vibemod-android-app-cec7` (or `main` after merge).
3. Scroll to **Artifacts** → download **VibeMod-windows**.
4. Unzip `VibeMod-windows-portable.zip`.
5. Run `VibeMod.exe` inside the unzipped folder (or the nested `VibeMod` / `bin` folder).

You can also open the PR: https://github.com/r4faelllaust/R4Fix/pull/3 → **Checks** → workflow → Artifacts.

## Option B — Run from source now (works even if CI is still building)

1. Install **Java 17+** (Temurin): https://adoptium.net/
2. Install **Git**: https://git-scm.com/
3. In PowerShell:

```powershell
git clone https://github.com/r4faelllaust/R4Fix.git
cd R4Fix
git checkout cursor/vibemod-android-app-cec7
cd vibemod-desktop
.\gradlew.bat run
```

Or double-click `vibemod-desktop\dist\run-vibemod.bat` after cloning.

## Android APK (for emulator / phone later)

1. https://github.com/r4faelllaust/R4Fix/actions/workflows/build-apk.yml
2. Download artifact **VibeMod-debug** → `app-debug.apk`
3. Install with Android emulator or sideload to your phone when ready.
