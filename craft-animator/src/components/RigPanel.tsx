import { useMemo, useState } from 'react'
import { frameAt } from '../core/document'
import { findPoseSymbols } from '../xfl/poseSymbols'
import { useEditor } from '../store/EditorContext'

/**
 * Works on Maple AND imported DeviantArt / Animate rigs:
 * finds Eyes / Mouth / Hand multi-frame symbols and scrubs firstFrame
 * on every instance of that symbol in the document tree.
 */
export function RigPanel() {
  const { doc, setDoc, setStatus } = useEditor()
  const poses = useMemo(() => findPoseSymbols(doc), [doc])
  const [active, setActive] = useState<string | null>(null)

  const setSymbolFrame = (symbolName: string, frame: number) => {
    setDoc((d) => {
      const next = structuredClone(d)
      const visitTimeline = (layers: typeof next.timeline.layers) => {
        for (const layer of layers) {
          for (const fr of layer.frames) {
            for (const el of fr.elements) {
              if (
                el.kind === 'symbol' &&
                (el.libraryItemName === symbolName ||
                  el.libraryItemName.endsWith('/' + symbolName) ||
                  el.libraryItemName.split('/').pop() ===
                    symbolName.split('/').pop())
              ) {
                el.firstFrame = frame
                el.loop = 'single frame'
              }
            }
          }
        }
      }
      visitTimeline(next.timeline.layers)
      for (const sym of Object.values(next.library.symbols)) {
        visitTimeline(sym.timeline.layers)
      }
      return next
    })
    setActive(symbolName)
    setStatus(`${symbolName.split('/').pop()} → frame ${frame}`)
  }

  const currentFrameOf = (symbolName: string): number => {
    const sym = doc.library.symbols[symbolName]
    if (!sym) return 0
    // Prefer reading from Head-assembled style instances
    for (const s of Object.values(doc.library.symbols)) {
      for (const layer of s.timeline.layers) {
        const fr = frameAt(layer, 0)
        const el = fr?.elements.find(
          (e) =>
            e.kind === 'symbol' &&
            (e.libraryItemName === symbolName ||
              e.libraryItemName.endsWith('/' + symbolName.split('/').pop()!)),
        )
        if (el && el.kind === 'symbol') return el.firstFrame ?? 0
      }
    }
    return 0
  }

  if (!poses.length) {
    return (
      <section className="panel rig-panel">
        <header className="panel-head">
          <h2>Rig / Poses</h2>
        </header>
        <div className="props-empty">
          <p>
            Import a .fla puppet (like cartman1235 Eric) — eye / mouth symbols
            with multiple frames show up here for one-click posing.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="panel rig-panel" aria-label="Rig poses">
      <header className="panel-head">
        <h2>Rig / Poses</h2>
        <span className="count">{poses.length}</span>
      </header>
      <div className="rig-panel-body">
        {poses.map((p) => {
          const cur = currentFrameOf(p.name)
          const label = p.name.split('/').pop()!
          const max = Math.min(p.frames, 16)
          return (
            <div
              key={p.name}
              className={`rig-pose-block ${active === p.name ? 'on' : ''}`}
            >
              <div className="rig-pose-title">
                <span className={`kind-tag ${p.kind}`}>{p.kind}</span>
                <strong title={p.name}>{label}</strong>
                <span className="muted">{p.frames}f</span>
              </div>
              <div className="pose-chips">
                {Array.from({ length: max }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={cur === i ? 'chip active' : 'chip'}
                    onClick={() => setSymbolFrame(p.name, i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
