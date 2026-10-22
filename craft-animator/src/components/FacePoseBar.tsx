import { frameAt } from '../core/document'
import { useEditor } from '../store/EditorContext'

const EYE_LABELS = ['Open', 'Happy', 'Wink', 'Surprised']
const MOUTH_LABELS = ['Smile', 'Talk', 'O', 'Frown']

/** Quick rig controls for nested eye/mouth graphic swaps (DA Animate style). */
export function FacePoseBar() {
  const { doc, setDoc, setStatus } = useEditor()

  const head = doc.library.symbols['Maple/HeadAssembled']
  if (!head) return null

  const eyesLayer = head.timeline.layers.find((l) => /eye/i.test(l.name))
  const mouthLayer = head.timeline.layers.find((l) => /mouth/i.test(l.name))
  const eyesFr = eyesLayer ? frameAt(eyesLayer, 0) : null
  const mouthFr = mouthLayer ? frameAt(mouthLayer, 0) : null
  const eyesEl = eyesFr?.elements.find((e) => e.kind === 'symbol')
  const mouthEl = mouthFr?.elements.find((e) => e.kind === 'symbol')

  const setPose = (which: 'eyes' | 'mouth', frame: number) => {
    setDoc((d) => {
      const h = d.library.symbols['Maple/HeadAssembled']
      if (!h) return d
      const layer = h.timeline.layers.find((l) =>
        which === 'eyes' ? /eye/i.test(l.name) : /mouth/i.test(l.name),
      )
      const fr = layer ? frameAt(layer, 0) : null
      const el = fr?.elements.find((e) => e.kind === 'symbol')
      if (!el || el.kind !== 'symbol') return d
      // In-place mutate + shallow doc copy so React sees a new ref without deep clone
      el.firstFrame = frame
      el.loop = 'single frame'
      return {
        ...d,
        library: {
          ...d.library,
          symbols: { ...d.library.symbols },
        },
      }
    })
    setStatus(
      which === 'eyes'
        ? `Eyes → ${EYE_LABELS[frame] ?? frame}`
        : `Mouth → ${MOUTH_LABELS[frame] ?? frame}`,
    )
  }

  return (
    <div className="face-pose-bar">
      <div className="fp-group">
        <span>Eyes</span>
        {EYE_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={
              eyesEl && eyesEl.kind === 'symbol' && (eyesEl.firstFrame ?? 0) === i
                ? 'chip active'
                : 'chip'
            }
            onClick={() => setPose('eyes', i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="fp-group">
        <span>Mouth</span>
        {MOUTH_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={
              mouthEl &&
              mouthEl.kind === 'symbol' &&
              (mouthEl.firstFrame ?? 0) === i
                ? 'chip active'
                : 'chip'
            }
            onClick={() => setPose('mouth', i)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
