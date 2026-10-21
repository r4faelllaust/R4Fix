import { useEditor } from '../store/EditorContext'

const SWATCHES = [
  '#000000',
  '#ffffff',
  '#c45c3a',
  '#3d6b4f',
  '#4a5d78',
  '#f0a05a',
  '#6ec8ff',
  '#e86b6b',
  '#f3c39a',
  '#2a241c',
  '#b7d4c5',
  '#4fa3ff',
  '#ff6b8a',
  '#e8b84a',
  '#888888',
  '#333333',
]

export function ColorPanel() {
  const { doc, setDoc, setStatus } = useEditor()
  return (
    <section className="panel color-panel" aria-label="Color">
      <header className="panel-head">
        <h2>Color</h2>
      </header>
      <div className="color-body">
        <label className="color-stage-row">
          <span>Stage</span>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(doc.backgroundColor) ? doc.backgroundColor : '#b7d4c5'}
            onChange={(e) => {
              const c = e.target.value
              setDoc((d) => ({ ...d, backgroundColor: c }))
              setStatus(`Stage color ${c}`)
            }}
          />
          <code>{doc.backgroundColor}</code>
        </label>
        <div className="swatch-grid">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              className="swatch-cell"
              style={{ background: c }}
              title={`Stage ${c}`}
              onClick={() => {
                setDoc((d) => ({ ...d, backgroundColor: c }))
                setStatus(`Stage color ${c}`)
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
