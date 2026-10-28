#!/usr/bin/env bash
# Boot Galaxy S24–like AVD, install debug APK, launch VibeMod.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

AVD_NAME="${AVD_NAME:-VibeMod_S24}"

if ! emulator -list-avds | grep -qx "$AVD_NAME"; then
  echo "Creating AVD $AVD_NAME…"
  sdkmanager "system-images;android-34;google_apis;x86_64" "emulator"
  echo no | avdmanager create avd -n "$AVD_NAME" -k "system-images;android-34;google_apis;x86_64" -d pixel_7
fi

if ! adb devices | grep -q emulator; then
  echo "Starting emulator $AVD_NAME…"
  emulator -avd "$AVD_NAME" -no-snapshot-save -gpu auto -memory 3072 >/tmp/vibemod-emulator.log 2>&1 &
fi

echo "Waiting for device…"
adb wait-for-device
until [[ "$(adb shell getprop sys.boot_completed | tr -d '\r')" == "1" ]]; do sleep 2; done

cd "$ROOT"
./gradlew :app:assembleDebug
APK="app/build/outputs/apk/debug/app-debug.apk"
adb install -r "$APK"
adb shell am start -n com.example.vibemod.debug/com.example.vibemod.MainActivity
echo "VibeMod launched on $AVD_NAME"
echo "APK: $ROOT/$APK"
