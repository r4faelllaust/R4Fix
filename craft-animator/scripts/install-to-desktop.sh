#!/usr/bin/env bash
# Puts a double-clickable Craft Animator on your Desktop
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="${XDG_DESKTOP_DIR:-$HOME/Desktop}"
if [[ ! -d "$DESKTOP" ]]; then
  DESKTOP="$HOME/Desktop"
  mkdir -p "$DESKTOP"
fi

chmod +x "$ROOT/scripts/start-desktop.sh" "$ROOT/scripts/install-to-desktop.sh"

# Prefer copying the AppImage (true double-click binary)
APPIMAGE=$(ls -1 "$ROOT"/release/Craft-Animator-*.AppImage 2>/dev/null | head -n1 || true)
if [[ -n "${APPIMAGE}" && -f "$APPIMAGE" ]]; then
  DEST="$DESKTOP/Craft Animator.AppImage"
  cp -f "$APPIMAGE" "$DEST"
  chmod +x "$DEST"
  echo "Created: $DEST"
  echo "Double-click \"Craft Animator.AppImage\" on your Desktop to open the app."
  exit 0
fi

ICON_SRC="$ROOT/build/icon.png"
[[ -f "$ICON_SRC" ]] || ICON_SRC="$ROOT/public/favicon.svg"
LAUNCHER="$ROOT/scripts/start-desktop.sh"
OUT="$DESKTOP/Craft Animator.desktop"
cat > "$OUT" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Craft Animator
Comment=Open-source Adobe Animate–style 2D animation
Exec="$LAUNCHER"
Icon=$ICON_SRC
Terminal=false
Categories=Graphics;2DGraphics;
StartupWMClass=craft-animator
EOF
chmod +x "$OUT"
gio set "$OUT" metadata::trusted true 2>/dev/null || true
echo "Created: $OUT"
echo "Tip: run npm run dist:linux first for a standalone AppImage on the Desktop."
