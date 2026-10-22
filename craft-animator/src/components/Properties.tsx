import { useEffect, useState } from 'react'
import { frameAt } from '../core/document'
import { decompose } from '../core/matrix'
import { useEditor } from '../store/EditorContext'

type PropTab = 'tool' | 'object' | 'frame' | 'doc'

/** Animate 2020–style Properties: Tool / Object / Frame / Doc tabs */
export function PropertiesPanel() {
  const {
    doc,
    selection,
    playback,
    tool,
    updateSelectedSymbolFirstFrame,
    setDoc,
    selectedLayerId,
  } = useEditor()
  const [tab, setTab] = useState<PropTab>('doc')

  const layer = doc.timeline.layers.find((l) => l.id === selection.layerId)
  const fr = layer ? frameAt(layer, playback.currentFrame) : null
  const el = fr?.elements.find((e) => selection.elementIds.includes(e.id))
  const selectedId = el?.id ?? null

  // Jump to Object when selection changes (user can still switch tabs)
  useEffect(() => {
    if (selectedId) setTab('object')
    else setTab((t) => (t === 'object' ? 'doc' : t))
  }, [selectedId])

  return (
    <section className="panel props-panel animate-pi" aria-label="Properties">
      <header className="panel-head pi-tabs">
        {(
          [
            ['tool', 'Tool'],
            ['object', 'Object'],
            ['frame', 'Frame'],
            ['doc', 'Doc'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`pi-tab ${tab === id ? 'active' : ''} ${id === 'object' && !el ? 'disabled' : ''}`}
            disabled={id === 'object' && !el}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </header>

      <div className="props-body">
        {tab === 'tool' && (
          <div className="pi-section">
            <h3>CURRENT TOOL</h3>
            <div className="prop-row">
              <span>Tool</span>
              <strong className="cap">{tool}</strong>
            </div>
            <p className="muted">
              Options for the selected tool appear here (Animate Property
              inspector → Tool tab).
            </p>
          </div>
        )}

        {tab === 'object' && el && (
          <div className="pi-section">
            <h3>INSTANCE</h3>
            <div className="prop-row">
              <span>Type</span>
              <strong>{el.kind}</strong>
            </div>
            {el.kind === 'symbol' && (
              <>
                <div className="prop-row">
                  <span>Symbol</span>
                  <strong className="mono">{el.libraryItemName}</strong>
                </div>
                <div className="prop-row">
                  <span>Instance name</span>
                  <input
                    className="pi-input"
                    defaultValue={el.name || ''}
                    placeholder="<None>"
                    onBlur={(e) => {
                      const v = e.target.value
                      setDoc((d) => {
                        const next = structuredClone(d)
                        const L = next.timeline.layers.find(
                          (l) => l.id === selection.layerId,
                        )
                        const F = L && frameAt(L, playback.currentFrame)
                        const E = F?.elements.find((x) => x.id === el.id)
                        if (E) E.name = v || undefined
                        return next
                      })
                    }}
                  />
                </div>
              </>
            )}
            {(() => {
              const d = decompose(el.matrix)
              return (
                <>
                  <h3>POSITION AND SIZE</h3>
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
                      W
                      <input type="number" value={Math.round(Math.abs(d.scaleX) * 100)} readOnly />
                    </label>
                    <label>
                      H
                      <input type="number" value={Math.round(Math.abs(d.scaleY) * 100)} readOnly />
                    </label>
                  </div>
                  <h3>TRANSFORM</h3>
                  <label className="first-frame">
                    Rotation
                    <input type="number" value={Math.round(d.rotation)} readOnly />
                  </label>
                </>
              )
            })()}
            {el.kind === 'symbol' && (
              <>
                <h3>LOOPING</h3>
                <label className="first-frame">
                  First
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
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={(el.firstFrame ?? 0) === n ? 'chip active' : 'chip'}
                      onClick={() => updateSelectedSymbolFirstFrame(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'frame' && (
          <div className="pi-section">
            <h3>FRAME</h3>
            <div className="prop-row">
              <span>Frame</span>
              <strong>{playback.currentFrame}</strong>
            </div>
            <div className="prop-row">
              <span>Layer</span>
              <strong>{layer?.name ?? '—'}</strong>
            </div>
            <div className="prop-row">
              <span>Label</span>
              <strong>{fr?.label || '<None>'}</strong>
            </div>
            <div className="prop-row">
              <span>Tween</span>
              <strong>{fr?.tweenType || 'none'}</strong>
            </div>
          </div>
        )}

        {tab === 'doc' && (
          <div className="pi-section">
            <h3>DOCUMENT SETTINGS</h3>
            <div className="prop-grid">
              <label>
                W (px)
                <input
                  type="number"
                  value={doc.width}
                  onChange={(e) =>
                    setDoc((d) => ({
                      ...d,
                      width: Math.max(1, Number(e.target.value) || d.width),
                    }))
                  }
                />
              </label>
              <label>
                H (px)
                <input
                  type="number"
                  value={doc.height}
                  onChange={(e) =>
                    setDoc((d) => ({
                      ...d,
                      height: Math.max(1, Number(e.target.value) || d.height),
                    }))
                  }
                />
              </label>
              <label>
                FPS
                <input
                  type="number"
                  value={doc.frameRate}
                  onChange={(e) =>
                    setDoc((d) => ({
                      ...d,
                      frameRate: Math.max(1, Number(e.target.value) || 24),
                    }))
                  }
                />
              </label>
              <label>
                Stage
                <input
                  type="color"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(doc.backgroundColor)
                      ? doc.backgroundColor
                      : '#ffffff'
                  }
                  onChange={(e) =>
                    setDoc((d) => ({ ...d, backgroundColor: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="prop-row">
              <span>Source</span>
              <strong>{doc.sourceFormat ?? 'caproj'}</strong>
            </div>
            <p className="muted tiny">Layer: {selectedLayerId?.slice(0, 10) ?? '—'}</p>
          </div>
        )}
      </div>
    </section>
  )
}
