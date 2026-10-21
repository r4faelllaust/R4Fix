import { useRef, useState } from 'react'
import { createBounceLogoDocument } from '../rigs/extraScenes'
import { useEditor } from '../store/EditorContext'

/** Minecraft-client style start screen — big Play, clear choices, no terminal. */
export function Launcher() {
  const {
    showWelcome,
    loadMaple,
    newBlank,
    importFromFile,
    setShowWelcome,
    setDoc,
    setPlayback,
    setStatus,
  } = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
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
            loadMaple()
          }}
        >
          {busy ? 'Starting…' : 'Play'}
        </button>
        <p className="launcher-hint">Opens the Maple puppet demo — ready to animate</p>

        <div className="launcher-secondary">
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
          <button
            type="button"
            className="launcher-btn"
            onClick={() => inputRef.current?.click()}
          >
            Open FLA / XFL / project…
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
          <span>v0.2 · Adobe Animate–style timeline &amp; symbols</span>
          <span>Works offline · no account</span>
        </div>
      </div>
    </div>
  )
}
