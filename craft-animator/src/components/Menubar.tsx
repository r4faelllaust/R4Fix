import { useRef } from 'react'
import { useEditor } from '../store/EditorContext'

export function Menubar() {
  const {
    doc,
    newBlank,
    loadMaple,
    importFromFile,
    saveProject,
    setShowWelcome,
    playback,
    setPlayback,
  } = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <header className="menubar">
      <div className="menubar-brand">
        <span className="brand-mark" aria-hidden />
        <strong>Craft Animator</strong>
        <span className="doc-name">{doc.name}</span>
      </div>
      <nav className="menubar-actions">
        <button type="button" onClick={newBlank}>
          New
        </button>
        <button type="button" onClick={() => inputRef.current?.click()}>
          Import
        </button>
        <button type="button" onClick={saveProject}>
          Save
        </button>
        <button type="button" onClick={loadMaple}>
          Demo Puppet
        </button>
        <button
          type="button"
          onClick={() =>
            setPlayback((p) => ({ ...p, onionSkin: !p.onionSkin }))
          }
          className={playback.onionSkin ? 'on' : ''}
        >
          Onion
        </button>
        <button type="button" onClick={() => setShowWelcome(true)}>
          About
        </button>
      </nav>
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
    </header>
  )
}
