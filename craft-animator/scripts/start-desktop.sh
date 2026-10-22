#!/usr/bin/env bash
# Double-click / Desktop launcher for Craft Animator
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -x "$ROOT/release/Craft Animator" ]]; then
  exec "$ROOT/release/Craft Animator" "$@"
fi

# Unpacked electron-builder output (Linux)
if [[ -x "$ROOT/release/linux-unpacked/craft-animator" ]]; then
  exec "$ROOT/release/linux-unpacked/craft-animator" "$@"
fi

# AppImage
shopt -s nullglob
for img in "$ROOT"/release/*.AppImage; do
  chmod +x "$img"
  exec "$img" "$@"
done

# Dev fallback: build UI then run Electron
if [[ ! -d "$ROOT/node_modules/electron" ]]; then
  npm install
fi
if [[ ! -f "$ROOT/dist/index.html" ]]; then
  npm run build
fi
exec npx electron "$ROOT/electron/main.cjs" "$@"
