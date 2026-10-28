# Download VibeMod (easy)

## Android APK (phone / emulator)

### 1-click style (GitHub Release — after the release workflow finishes)
Open **Releases**: https://github.com/r4faelllaust/R4Fix/releases  
Download **`VibeMod-android-debug.apk`**.

Then on your phone/emulator: open the APK → allow install from that source → Install.  
Debug app id: `com.example.vibemod.debug`

### Also available as Actions artifact
1. https://github.com/r4faelllaust/R4Fix/actions/workflows/build-apk.yml  
2. Latest **green** run → **Artifacts** → **VibeMod-android-debug** (or **VibeMod-debug**)  
3. Unzip the artifact → install the `.apk`

Latest successful APK build example: https://github.com/r4faelllaust/R4Fix/actions/runs/40753993477

## Windows laptop
1. https://github.com/r4faelllaust/R4Fix/releases → **`VibeMod-windows-portable.zip`**  
   **or** Actions: https://github.com/r4faelllaust/R4Fix/actions/workflows/build-desktop-windows.yml → artifact **VibeMod-windows**
2. Unzip → run the app

## From source (always works)
```powershell
git clone https://github.com/r4faelllaust/R4Fix.git
cd R4Fix
git checkout cursor/vibemod-android-app-cec7
# Android APK:
cd vibemod
.\gradlew.bat assembleDebug
# APK at: app\build\outputs\apk\debug\app-debug.apk

# Windows desktop:
cd ..\vibemod-desktop
.\gradlew.bat run
```
