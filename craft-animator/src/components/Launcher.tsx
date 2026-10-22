import { useEffect, useRef, useState } from 'react'
import { createBounceLogoDocument } from '../rigs/extraScenes'
import { useEditor } from '../store/EditorContext'

/** Minecraft-client style start screen — big Play, clear choices, no terminal. */
export function Launcher() {
  const {
    showWelcome,
    loadMaple,
    newBlank,
    importFromFile,
    openRigPicker,
    setShowWelcome,
    setDoc,
    setPlayback,
    setStatus,
  } = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowWelcome(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setShowWelcome])

  if (!showWelcome) return null

  return (
    <div className="launcher">
      <div className="launcher-bg" aria-hidden />
      <div className="launcher-panel">
        <div className="launcher-brand">
          <div className="launcher-logo" aria-hidden />
          <div>
            <h1>Craft Animator</h1>
            <p className="launcher-sub">2D animation studio · free · offline</p>
          </div>
        </div>

        <button
          type="button"
          className="launcher-play"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            void openRigPicker().finally(() => setBusy(false))
          }}
        >
          {busy ? 'Opening…' : 'Open Rig'}
        </button>
        <p className="launcher-hint">
          Open a .fla puppet (Eric-style DeviantArt rigs) — or drag the file onto the window
        </p>

        <div className="launcher-secondary">
          <button
            type="button"
            className="launcher-btn"
            onClick={() => {
              setBusy(true)
              loadMaple()
            }}
          >
            Demo: Maple puppet
          </button>
          <button
            type="button"
            className="launcher-btn"
            onClick={() => {
              setDoc(createBounceLogoDocument())
              setPlayback((p) => ({ ...p, currentFrame: 0, playing: true }))
              setShowWelcome(false)
              setStatus('Bounce Logo scene — press Space to pause')
            }}
          >
            Sample: Bounce Logo
          </button>
          <button
            type="button"
            className="launcher-btn"
            onClick={() => {
              newBlank()
              setShowWelcome(false)
            }}
          >
            New blank file
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".fla,.xfl,.zip,.json,.caproj,.caproj.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) {
              setBusy(true)
              void importFromFile(f)
            }
          }}
        />

        <div className="launcher-footer">
          <span>v0.3 · Open .fla rigs · pose panel</span>
          <span>Works offline · no account</span>
        </div>
      </div>
    </div>
  )
}
