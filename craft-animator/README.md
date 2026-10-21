# Craft Animator

**Open-source 2D animation in the spirit of Adobe Animate** — timeline, symbols, nested puppet rigs, and FLA/XFL import — running in your browser.

Inspired by the ArtCraft “vibe-coded” open-source suite ([LightCraft](https://github.com/storytold/lightcraft), [EffectCraft](https://github.com/storytold/effectcraft), and friends): familiar panels, readable project JSON, and tools that stay on your machine. Craft Animator fills the **Animate / Flash character-animation** gap those apps don’t cover.

Not affiliated with Adobe or ArtCraft.

## Quick start (browser)

```bash
cd craft-animator
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Desktop app (double-click)

```bash
cd craft-animator
npm install
npm run dist:linux    # Linux AppImage
# npm run dist:win    # Windows portable .exe (build on Windows)
npm run desktop:install
```

That copies **Craft Animator.AppImage** to your Desktop — double-click to open.

Or run without packaging:

```bash
npm run desktop
```

Windows: double-click `scripts/Start Craft Animator.bat`, or build `npm run dist:win` and use `release/Craft-Animator-Portable.exe`.

## What you get

| Area | Status |
| --- | --- |
| Stage + pan/zoom | Yes |
| Timeline / layers / playhead | Yes |
| Library (symbols & bitmaps) | Yes |
| Nested symbol rendering | Yes |
| Eye / mouth pose swaps (firstFrame) | Yes — Maple demo + Properties |
| Import `.fla` (ZIP/XFL) | Yes (structure + shapes/bitmaps; vector fidelity varies) |
| Import zipped uncompressed XFL folder | Yes |
| Save `.caproj.json` | Yes |
| Drawing tools | Toolbar present; pencil/brush stroke capture is next |
| Bone IK | Pose/rotate selection; full armature next |

## DeviantArt / Animate rig compatibility

Community puppets such as [cartman1235’s Adobe Animate rigs](https://www.deviantart.com/cartman1235) use nested movie clips and multi-frame graphic symbols for faces and hands. Craft Animator targets that workflow:

1. In **Adobe Animate**, save as `.fla`, or **File → Save As → Flash CS5 Uncompressed Document (*.xfl)**.
2. For XFL folders, zip the folder that contains `DOMDocument.xml` + `LIBRARY/`.
3. In Craft Animator: **Import** (or the welcome screen).
4. Scrub **First Frame** on graphic instances (or use the Eyes/Mouth bar on the Maple demo).

We ship **Maple**, an original demo puppet in that nested-symbol style — not a copy of any franchise character.

## Project format

Projects save as versioned JSON (`.caproj.json`), similar in spirit to EffectCraft’s `.ecproj`: diffable, readable, no proprietary lock-in.

## Scripts

- `npm run dev` — local editor
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the build

## License

MIT — use it, fork it, ship it.
