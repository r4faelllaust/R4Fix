#!/usr/bin/env bash
set -euo pipefail
OUT="${1:-/opt/cursor/artifacts}"
mkdir -p "$OUT"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
STAMP=$(date +%Y%m%d_%H%M%S)
adb wait-for-device
adb shell screencap -p /sdcard/vibemod_screen.png
adb pull /sdcard/vibemod_screen.png "$OUT/emulator_vibemod_${STAMP}.png"
adb logcat -d -t 200 '*:E' VibeMod:V AndroidRuntime:E > "$OUT/emulator_logcat_${STAMP}.txt" || true
echo "Saved screenshot + logcat under $OUT"
