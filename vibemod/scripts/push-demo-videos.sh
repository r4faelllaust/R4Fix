#!/usr/bin/env bash
# Push local MP4s into the emulator Movies folder for Photo Picker / Files import.
set -euo pipefail
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

if [[ $# -lt 1 ]]; then
  cat <<'EOF'
Usage: ./push-demo-videos.sh video1.mp4 [video2.mp4 ...]

Then on the emulator:
  1. Open VibeMod → Library → +
  2. Pick the video from Downloads/Movies
  3. Or enable demo streams in Mod Center (needs network)

EOF
  exit 1
fi

adb wait-for-device
adb shell mkdir -p /sdcard/Movies/VibeMod /sdcard/Download/VibeMod
for f in "$@"; do
  base="$(basename "$f")"
  adb push "$f" "/sdcard/Movies/VibeMod/$base"
  adb push "$f" "/sdcard/Download/VibeMod/$base"
  echo "Pushed $base"
done
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Movies/VibeMod/
echo "Import via Library → + (Photo Picker) or Files app."
