import { frameAt, makeFrame, timelineLength } from '../core/document'
import { useEditor } from '../store/EditorContext'

/** Classic Adobe Animate Timeline — layers, onion, playhead, keyframe cells */
export function Timeline() {
  const {
    doc,
    setDoc,
    playback,
    setPlayback,
    selectedLayerId,
    setSelectedLayerId,
    totalFrames,
  } = useEditor()

  const frames = Math.max(totalFrames, 48)
  const frameWidth = 12

  const insertKeyframe = () => {
    if (!selectedLayerId) return
    setDoc((d) => {
      const next = structuredClone(d)
      const layer = next.timeline.layers.find((l) => l.id === selectedLayerId)
      if (!layer) return d
      const i = playback.currentFrame
      if (layer.frames.some((f) => f.index === i)) return d
      const prev = frameAt(layer, i)
      layer.frames.push(
        makeFrame(i, prev ? structuredClone(prev.elements) : [], 1),
      )
      layer.frames.sort((a, b) => a.index - b.index)
      return next
    })
  }

  return (
    <section className="timeline animate-timeline" aria-label="Timeline">
      <div className="timeline-transport">
        <div className="tl-controls">
          <button
            type="button"
            title="Onion Skin"
            className={playback.onionSkin ? 'on' : ''}
            onClick={() =>
              setPlayback((p) => ({ ...p, onionSkin: !p.onionSkin }))
            }
          >
            ◐
          </button>
          <button
            type="button"
            title="Loop"
            className={playback.loop ? 'on' : ''}
            onClick={() => setPlayback((p) => ({ ...p, loop: !p.loop }))}
          >
            ⟳
          </button>
          <span className="tl-sep" />
          <button
            type="button"
            title="Go to first frame"
            onClick={() =>
              setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
            }
          >
            ⏮
          </button>
          <button
            type="button"
            title="Step back"
            onClick={() =>
              setPlayback((p) => ({
                ...p,
                currentFrame: Math.max(0, p.currentFrame - 1),
                playing: false,
              }))
            }
          >
            ‹
          </button>
          <button
            type="button"
            className="play"
            title="Play (Enter / Space)"
            onClick={() =>
              setPlayback((p) => ({ ...p, playing: !p.playing }))
            }
          >
            {playback.playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            title="Step forward"
            onClick={() =>
              setPlayback((p) => ({
                ...p,
                currentFrame: Math.min(frames - 1, p.currentFrame + 1),
                playing: false,
              }))
            }
          >
            ›
          </button>
          <button
            type="button"
            title="Go to last frame"
            onClick={() =>
              setPlayback((p) => ({
                ...p,
                currentFrame: frames - 1,
                playing: false,
              }))
            }
          >
            ⏭
          </button>
          <span className="tl-sep" />
          <button type="button" title="Insert Keyframe (F6)" onClick={insertKeyframe}>
            ●
          </button>
          <label className="frame-readout">
            <input
              type="number"
              min={0}
              max={frames - 1}
              value={playback.currentFrame}
              onChange={(e) =>
                setPlayback((p) => ({
                  ...p,
                  currentFrame: Number(e.target.value) || 0,
                  playing: false,
                }))
              }
            />
          </label>
        </div>
        <span className="fps">{doc.frameRate} fps</span>
      </div>

      <div className="timeline-body">
        <div className="layer-list">
          <div className="layer-list-head">
            <span>Layer</span>
            <span className="layer-head-icons">👁 🔒</span>
          </div>
          {doc.timeline.layers.map((layer) => (
            <div
              key={layer.id}
              className={`layer-row ${selectedLayerId === layer.id ? 'active' : ''}`}
              onClick={() => setSelectedLayerId(layer.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedLayerId(layer.id)
              }}
              role="button"
              tabIndex={0}
            >
              <span className="layer-swatch" style={{ background: layer.color }} />
              <span className="layer-name">{layer.name}</span>
              <span className="layer-flags">
                <button
                  type="button"
                  className="layer-icon"
                  title="Visibility"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDoc((d) => {
                      const next = structuredClone(d)
                      const L = next.timeline.layers.find((l) => l.id === layer.id)
                      if (L) L.visible = !L.visible
                      return next
                    })
                  }}
                >
                  {layer.visible ? '👁' : '–'}
                </button>
                <button
                  type="button"
                  className="layer-icon"
                  title="Lock"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDoc((d) => {
                      const next = structuredClone(d)
                      const L = next.timeline.layers.find((l) => l.id === layer.id)
                      if (L) L.locked = !L.locked
                      return next
                    })
                  }}
                >
                  {layer.locked ? '🔒' : '○'}
                </button>
              </span>
            </div>
          ))}
          <button
            type="button"
            className="layer-add"
            onClick={() =>
              setDoc((d) => {
                const next = structuredClone(d)
                const n = next.timeline.layers.length + 1
                next.timeline.layers.unshift({
                  id: `layer_${Date.now()}`,
                  name: `Layer_${n}`,
                  color: '#4fa3ff',
                  visible: true,
                  locked: false,
                  layerType: 'normal',
                  frames: [makeFrame(0)],
                })
                return next
              })
            }
          >
            + New Layer
          </button>
        </div>
        <div className="frames-scroll">
          <div className="frame-header" style={{ width: frames * frameWidth }}>
            {Array.from({ length: frames }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`frame-tick ${playback.currentFrame === i ? 'playhead' : ''}`}
                style={{ width: frameWidth }}
                onClick={() =>
                  setPlayback((p) => ({
                    ...p,
                    currentFrame: i,
                    playing: false,
                  }))
                }
              >
                {i % 5 === 0 ? i + 1 : ''}
              </button>
            ))}
          </div>
          {doc.timeline.layers.map((layer) => (
            <div
              key={layer.id}
              className="frame-row"
              style={{ width: frames * frameWidth }}
            >
              {Array.from({ length: frames }, (_, i) => {
                const fr = frameAt(layer, i)
                const isKey = fr && fr.index === i
                const hasContent = !!fr && fr.elements.length > 0
                const isTween = fr?.tweenType === 'motion'
                return (
                  <button
                    key={i}
                    type="button"
                    className={[
                      'cell',
                      isKey ? 'key' : fr ? 'span' : 'empty',
                      hasContent ? 'filled' : '',
                      isTween ? 'tween' : '',
                      playback.currentFrame === i ? 'playhead' : '',
                    ].join(' ')}
                    style={{ width: frameWidth }}
                    onClick={() => {
                      setSelectedLayerId(layer.id)
                      setPlayback((p) => ({
                        ...p,
                        currentFrame: i,
                        playing: false,
                      }))
                    }}
                    onDoubleClick={insertKeyframe}
                    title={
                      fr?.label ||
                      (isKey ? 'Keyframe' : fr ? 'Frame' : 'Empty')
                    }
                  />
                )
              })}
            </div>
          ))}
          <div
            className="playhead-line"
            style={{
              left: playback.currentFrame * frameWidth + frameWidth / 2,
            }}
          />
        </div>
      </div>
      <div className="timeline-meta">
        Timeline · {doc.timeline.name} · {timelineLength(doc.timeline)} frames
      </div>
    </section>
  )
}
