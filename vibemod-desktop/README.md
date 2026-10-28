# VibeMod Desktop (Windows / macOS / Linux)

Local-first short-video companion to the Android VibeMod app. Import your own videos, swipe through a feed, customize badges/themes in Mod Center.

**Not affiliated with TikTok.**

## Download from GitHub

1. Open the repository **Actions** → workflow **Build VibeMod Desktop**
2. Download the artifact for your OS (`VibeMod-windows`, MSI/EXE when built on `windows-latest`)
3. Or grab a Release asset once published

Portable fat JAR (requires Java 17+):

```bash
cd vibemod-desktop
./gradlew run          # run from source
./gradlew packageExe   # Windows EXE (best on Windows CI)
./gradlew packageMsi   # Windows MSI (best on Windows CI)
```

## Features

- Feed with JavaFX media playback (local files + demo HTTPS samples)
- Library import via native file chooser
- Discover search across local metadata
- Profile + decorative badges (Blue / Gold / Purple / Creator / Developer)
- Mod Center: AMOLED, accents, playback defaults, demo toggle, badge visibility
- Preferences persisted under `~/.vibemod-desktop/`

## Requirements

- JDK 17+
- Network only if you enable demo sample streams
