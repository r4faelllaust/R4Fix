import { useMemo, useState } from 'react'
import { useEditor } from '../store/EditorContext'

export function LibraryPanel() {
  const { doc, setStatus } = useEditor()
  const [filter, setFilter] = useState('')

  const symbols = useMemo(() => {
    return Object.values(doc.library.symbols)
      .filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [doc.library.symbols, filter])

  const bitmaps = useMemo(
    () => Object.values(doc.library.bitmaps),
    [doc.library.bitmaps],
  )

  return (
    <section className="panel library-panel" aria-label="Library">
      <header className="panel-head">
        <h2>Library</h2>
        <span className="count">{symbols.length}</span>
      </header>
      <input
        className="panel-filter"
        placeholder="Filter symbols…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="library-list">
        {symbols.map((s) => (
          <button
            key={s.name}
            type="button"
            className="lib-item"
            onClick={() =>
              setStatus(
                `${s.name} · ${s.symbolType} · ${s.timeline.layers.length} layers`,
              )
            }
          >
            <span className={`sym-type ${s.symbolType}`}>
              {s.symbolType === 'graphic'
                ? 'G'
                : s.symbolType === 'button'
                  ? 'B'
                  : 'MC'}
            </span>
            <span className="sym-name">{s.name}</span>
          </button>
        ))}
        {bitmaps.map((b) => (
          <div key={b.name} className="lib-item bitmap">
            <span className="sym-type bmp">BMP</span>
            <span className="sym-name">{b.name}</span>
          </div>
        ))}
        {!symbols.length && !bitmaps.length && (
          <p className="empty-hint">Library is empty — import a FLA/XFL rig.</p>
        )}
      </div>
    </section>
  )
}
