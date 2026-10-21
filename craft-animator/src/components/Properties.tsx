import { frameAt } from '../core/document'
import { decompose } from '../core/matrix'
import { useEditor } from '../store/EditorContext'

export function PropertiesPanel() {
  const {
    doc,
    selection,
    playback,
    updateSelectedSymbolFirstFrame,
    setDoc,
    selectedLayerId,
  } = useEditor()

  const layer = doc.timeline.layers.find((l) => l.id === selection.layerId)
  const fr = layer ? frameAt(layer, playback.currentFrame) : null
  const el = fr?.elements.find((e) => selection.elementIds.includes(e.id))

  const faceSymbols = Object.values(doc.library.symbols).filter(
    (s) =>
      /eye|mouth|face|expression/i.test(s.name) ||
      s.timeline.layers.some((l) => l.frames.length > 1),
  )

  return (
    <section className="panel props-panel" aria-label="Properties">
      <header className="panel-head">
        <h2>Properties</h2>
      </header>

      {!el && (
        <div className="props-empty">
          <p>Select a symbol on the stage to edit transforms and face poses.</p>
          <p className="muted">
            Rig tip: eye/mouth swaps use <strong>First Frame</strong> on graphic
            instances — same workflow as Adobe Animate puppets.
          </p>
        </div>
      )}

      {el && (
        <div className="props-body">
          <div className="prop-row">
            <span>Kind</span>
            <strong>{el.kind}</strong>
          </div>
          {el.kind === 'symbol' && (
            <div className="prop-row">
              <span>Symbol</span>
              <strong className="mono">{el.libraryItemName}</strong>
            </div>
          )}
          {(() => {
            const d = decompose(el.matrix)
            return (
              <>
                <div className="prop-grid">
                  <label>
                    X
                    <input
                      type="number"
                      value={Math.round(d.x * 10) / 10}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setDoc((doc0) => {
                          const next = structuredClone(doc0)
                          const L = next.timeline.layers.find(
                            (l) => l.id === selection.layerId,
                          )
                          const F = L && frameAt(L, playback.currentFrame)
                          const E = F?.elements.find((x) => x.id === el.id)
                          if (E) E.matrix.tx = v
                          return next
                        })
                      }}
                    />
                  </label>
                  <label>
                    Y
                    <input
                      type="number"
                      value={Math.round(d.y * 10) / 10}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setDoc((doc0) => {
                          const next = structuredClone(doc0)
                          const L = next.timeline.layers.find(
                            (l) => l.id === selection.layerId,
                          )
                          const F = L && frameAt(L, playback.currentFrame)
                          const E = F?.elements.find((x) => x.id === el.id)
                          if (E) E.matrix.ty = v
                          return next
                        })
                      }}
                    />
                  </label>
                  <label>
                    Rotation
                    <input type="number" value={Math.round(d.rotation)} readOnly />
                  </label>
                </div>
              </>
            )
          })()}

          {el.kind === 'symbol' && (
            <div className="face-tools">
              <h3>Pose / First Frame</h3>
              <p className="muted">
                Scrub graphic symbol frames for mouths, eyes, and hand poses.
              </p>
              <label className="first-frame">
                First frame
                <input
                  type="number"
                  min={0}
                  value={el.firstFrame ?? 0}
                  onChange={(e) =>
                    updateSelectedSymbolFirstFrame(Number(e.target.value) || 0)
                  }
                />
              </label>
              <div className="pose-chips">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={
                      (el.firstFrame ?? 0) === n ? 'chip active' : 'chip'
                    }
                    onClick={() => updateSelectedSymbolFirstFrame(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rig-hints">
        <h3>Multi-frame symbols</h3>
        <ul>
          {faceSymbols.slice(0, 8).map((s) => (
            <li key={s.name}>
              <code>{s.name}</code>
              <span>
                {Math.max(...s.timeline.layers.map((l) => l.frames.length))}{' '}
                poses
              </span>
            </li>
          ))}
          {!faceSymbols.length && <li>Import a puppet to see pose symbols.</li>}
        </ul>
        <p className="muted tiny">
          Layer: {selectedLayerId?.slice(0, 12) ?? '—'} · Source:{' '}
          {doc.sourceFormat ?? 'caproj'}
        </p>
      </div>
    </section>
  )
}
