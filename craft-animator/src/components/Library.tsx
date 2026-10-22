import { useMemo, useState } from 'react'
import { compose } from '../core/matrix'
import { uid } from '../core/id'
import { makeFrame, makeLayer } from '../core/document'
import { useEditor } from '../store/EditorContext'

export function LibraryPanel() {
  const { doc, setDoc, setStatus, selectedLayerId, playback } = useEditor()
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

  const placeOnStage = (libraryItemName: string, symbolType: 'movieClip' | 'graphic' | 'button') => {
    setDoc((d) => {
      const next = structuredClone(d)
      const layer =
        next.timeline.layers.find((l) => l.id === selectedLayerId) ||
        next.timeline.layers[0]
      if (!layer) {
        next.timeline.layers.push(
          makeLayer('Layer_1', '#4fa3ff', [
            makeFrame(playback.currentFrame, [
              {
                kind: 'symbol',
                id: uid('el'),
                libraryItemName,
                symbolType,
                firstFrame: 0,
                loop: 'loop',
                matrix: compose({
                  x: next.width / 2,
                  y: next.height / 2,
                }),
              },
            ]),
          ]),
        )
        return next
      }
      let fr = layer.frames.find((f) => f.index === playback.currentFrame)
      if (!fr) {
        fr = makeFrame(playback.currentFrame, [])
        layer.frames.push(fr)
        layer.frames.sort((a, b) => a.index - b.index)
      }
      fr.elements.push({
        kind: 'symbol',
        id: uid('el'),
        libraryItemName,
        symbolType,
        firstFrame: 0,
        loop: 'loop',
        matrix: compose({
          x: next.width / 2 + (Math.random() * 40 - 20),
          y: next.height / 2 + (Math.random() * 40 - 20),
        }),
      })
      return next
    })
    setStatus(`Placed ${libraryItemName} on stage`)
  }

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
            title="Click to place on stage"
            onClick={() => placeOnStage(s.name, s.symbolType)}
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
          <p className="empty-hint">
            Library empty — use <strong>Open Rig</strong> and pick a .fla
          </p>
        )}
      </div>
    </section>
  )
}
