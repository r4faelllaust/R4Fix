import { useEffect, useRef } from 'react'
import { useEditor } from '../store/EditorContext'

export function Welcome() {
  const { showWelcome, setShowWelcome, loadMaple, newBlank, importFromFile } =
    useEditor()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showWelcome) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWelcome(false)
      } else if (e.key === 'Enter') {
        loadMaple()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showWelcome, setShowWelcome, loadMaple])

  if (!showWelcome) return null

  return (
    <div
      className="welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Craft Animator"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setShowWelcome(false)
      }}
    >
      <div className="welcome-card">
        <div className="welcome-brand">
          <span className="welcome-mark" aria-hidden />
          <h1>Craft Animator</h1>
        </div>
        <p className="welcome-tag">
          Open-source 2D animation in the spirit of Adobe Animate — timeline,
          symbols, and puppet rigs you can actually open.
        </p>
        <div className="welcome-actions">
          <button
            type="button"
            className="btn primary"
            autoFocus
            onClick={() => loadMaple()}
          >
            Open Maple demo puppet
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => inputRef.current?.click()}
          >
            Import FLA / XFL / .caproj
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              newBlank()
              setShowWelcome(false)
            }}
          >
            Blank document
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".fla,.xfl,.zip,.json,.caproj,.caproj.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importFromFile(f)
          }}
        />
        <p className="welcome-foot">
          Built for DeviantArt Animate community workflows (nested symbols, eye /
          mouth swaps). Drop a cartman1235-style .fla or zipped XFL folder to try
          your own rigs. Clean-room project — not affiliated with Adobe or ArtCraft.
          Press Enter for Maple, Esc to dismiss.
        </p>
      </div>
    </div>
  )
}
