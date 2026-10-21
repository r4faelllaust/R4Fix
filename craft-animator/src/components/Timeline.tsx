import { frameAt, timelineLength } from '../core/document'
import { useEditor } from '../store/EditorContext'

export function Timeline() {
  const {
    doc,
    playback,
    setPlayback,
    selectedLayerId,
    setSelectedLayerId,
    totalFrames,
  } = useEditor()

  const frames = Math.max(totalFrames, 24)
  const frameWidth = 14

  return (
    <section className="timeline" aria-label="Timeline">
      <div className="timeline-transport">
        <button
          type="button"
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
          onClick={() =>
            setPlayback((p) => ({ ...p, playing: !p.playing }))
          }
        >
          {playback.playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
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
        <label className="frame-readout">
          Frame
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
          / {frames}
        </label>
        <span className="fps">{doc.frameRate} fps</span>
      </div>

      <div className="timeline-body">
        <div className="layer-list">
          {doc.timeline.layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={`layer-row ${selectedLayerId === layer.id ? 'active' : ''}`}
              onClick={() => setSelectedLayerId(layer.id)}
            >
              <span
                className="layer-swatch"
                style={{ background: layer.color }}
              />
              <span className="layer-name">{layer.name}</span>
              <span className="layer-flags">
                {layer.visible ? '👁' : '—'}
                {layer.locked ? '🔒' : ''}
              </span>
            </button>
          ))}
        </div>
        <div className="frames-scroll">
          <div
            className="frame-header"
            style={{ width: frames * frameWidth }}
          >
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
                {i % 5 === 0 ? i : ''}
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
                return (
                  <button
                    key={i}
                    type="button"
                    className={[
                      'cell',
                      isKey ? 'key' : fr ? 'span' : 'empty',
                      hasContent ? 'filled' : '',
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
                    title={fr?.label || (isKey ? 'Keyframe' : '')}
                  />
                )
              })}
            </div>
          ))}
          <div
            className="playhead-line"
            style={{ left: playback.currentFrame * frameWidth + frameWidth / 2 }}
          />
        </div>
      </div>
      <div className="timeline-meta">
        Scene: {doc.timeline.name} · length {timelineLength(doc.timeline)}f
      </div>
    </section>
  )
}
