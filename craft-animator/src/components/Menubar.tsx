import { useRef, useState } from 'react'
import { useEditor } from '../store/EditorContext'

type MenuId =
  | 'file'
  | 'edit'
  | 'view'
  | 'insert'
  | 'modify'
  | 'text'
  | 'commands'
  | 'control'
  | 'debug'
  | 'window'
  | 'help'
  | null

export function Menubar() {
  const {
    doc,
    newBlank,
    loadMaple,
    importFromFile,
    openRigPicker,
    saveProject,
    setShowWelcome,
    playback,
    setPlayback,
    setView,
    setTool,
  } = useEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState<MenuId>(null)

  const menus: { id: Exclude<MenuId, null>; label: string; items: { label: string; shortcut?: string; action: () => void; sep?: boolean }[] }[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: newBlank },
        { label: 'Open Rig…', shortcut: 'Ctrl+O', action: () => void openRigPicker() },
        { label: 'Open Maple Demo', action: loadMaple },
        { label: 'Close', sep: true, action: () => setShowWelcome(true) },
        { label: 'Save As…', shortcut: 'Ctrl+S', action: saveProject },
        { label: 'Import FLA / XFL…', sep: true, action: () => inputRef.current?.click() },
        { label: 'Return to Launcher', action: () => setShowWelcome(true) },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => {} },
        { label: 'Deselect All', action: () => {} },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        {
          label: 'Zoom In',
          shortcut: 'Ctrl+=',
          action: () => setView((v) => ({ ...v, zoom: Math.min(4, v.zoom * 1.25) })),
        },
        {
          label: 'Zoom Out',
          shortcut: 'Ctrl+-',
          action: () => setView((v) => ({ ...v, zoom: Math.max(0.2, v.zoom * 0.8) })),
        },
        {
          label: 'Fit in Window',
          action: () => setView({ zoom: 0.75, panX: 60, panY: 36 }),
        },
        {
          label: playback.onionSkin ? 'Onion Skin ✓' : 'Onion Skin',
          sep: true,
          action: () => setPlayback((p) => ({ ...p, onionSkin: !p.onionSkin })),
        },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        { label: 'Keyframe', shortcut: 'F6', action: () => {} },
        { label: 'Blank Keyframe', shortcut: 'F7', action: () => {} },
        { label: 'Frame', shortcut: 'F5', action: () => {} },
      ],
    },
    {
      id: 'modify',
      label: 'Modify',
      items: [
        { label: 'Document…', action: () => {} },
        { label: 'Convert to Symbol…', shortcut: 'F8', action: () => {} },
        {
          label: 'Transform ▸ Free Transform',
          sep: true,
          action: () => setTool('freeTransform'),
        },
        { label: 'Transform ▸ Scale and Rotate…', action: () => {} },
        { label: 'Arrange ▸ Bring to Front', action: () => {} },
        { label: 'Align ▸ Left', action: () => {} },
      ],
    },
    {
      id: 'text',
      label: 'Text',
      items: [
        { label: 'Font', action: () => setTool('text') },
        { label: 'Size', action: () => {} },
        { label: 'Style ▸ Bold', action: () => {} },
        { label: 'Align ▸ Left', action: () => {} },
      ],
    },
    {
      id: 'commands',
      label: 'Commands',
      items: [
        { label: 'Manage Saved Commands…', action: () => {} },
        { label: 'Get More Commands…', action: () => {} },
        { label: 'Run Command…', action: () => {} },
      ],
    },
    {
      id: 'control',
      label: 'Control',
      items: [
        {
          label: playback.playing ? 'Stop' : 'Play',
          shortcut: 'Enter',
          action: () => setPlayback((p) => ({ ...p, playing: !p.playing })),
        },
        {
          label: 'Rewind',
          action: () =>
            setPlayback((p) => ({ ...p, currentFrame: 0, playing: false })),
        },
        {
          label: 'Go To End',
          action: () => {},
        },
        {
          label: 'Loop Playback',
          sep: true,
          action: () => setPlayback((p) => ({ ...p, loop: !p.loop })),
        },
        {
          label: 'Test Movie',
          shortcut: 'Ctrl+Enter',
          action: () => setPlayback((p) => ({ ...p, playing: true, currentFrame: 0 })),
        },
      ],
    },
    {
      id: 'debug',
      label: 'Debug',
      items: [
        { label: 'Debug Movie', action: () => {} },
        { label: 'Continue', action: () => {} },
        { label: 'End Debug Session', action: () => {} },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Timeline', shortcut: 'Ctrl+Alt+T', action: () => {} },
        { label: 'Toolbars ▸ Controller', action: () => {} },
        { label: 'Tools', action: () => {} },
        { label: 'Properties', shortcut: 'Ctrl+F3', action: () => {} },
        { label: 'Library', shortcut: 'Ctrl+L', action: () => {} },
        { label: 'Color', action: () => {} },
        { label: 'Align', action: () => {} },
        { label: 'Transform', action: () => {} },
        { label: 'Actions', shortcut: 'F9', action: () => {} },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Animate Help…', action: () => setShowWelcome(true) },
        { label: 'About Craft Animator', action: () => setShowWelcome(true) },
        {
          label: 'Keyboard Shortcuts',
          sep: true,
          action: () => {},
        },
      ],
    },
  ]

  return (
    <header className="menubar animate-menubar">
      <div className="menubar-brand">
        <span className="brand-mark" aria-hidden />
        <strong>Craft Animator</strong>
      </div>
      <nav className="menu-strip" onMouseLeave={() => setOpen(null)}>
        {menus.map((m) => (
          <div key={m.id} className="menu-root">
            <button
              type="button"
              className={open === m.id ? 'menu-label open' : 'menu-label'}
              onMouseEnter={() => setOpen(m.id)}
              onClick={() => setOpen(open === m.id ? null : m.id)}
            >
              {m.label}
            </button>
            {open === m.id && (
              <div className="menu-dropdown">
                {m.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={item.sep ? 'menu-item sep' : 'menu-item'}
                    onClick={() => {
                      item.action()
                      setOpen(null)
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <kbd>{item.shortcut}</kbd>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <button type="button" className="open-rig-btn" onClick={() => void openRigPicker()}>
        Open Rig
      </button>
      <span className="menubar-spacer" />
      {/* doc used for future multi-doc tabs */}
      <span className="sr-only">{doc.name}</span>
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
