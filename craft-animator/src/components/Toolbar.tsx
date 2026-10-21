import type { ToolId } from '../core/types'
import { useEditor } from '../store/EditorContext'

const TOOLS: { id: ToolId; label: string; tip: string }[] = [
  { id: 'select', label: 'V', tip: 'Selection' },
  { id: 'freeTransform', label: 'Q', tip: 'Free Transform' },
  { id: 'bone', label: 'M', tip: 'Bone / Pose' },
  { id: 'pencil', label: 'Y', tip: 'Pencil' },
  { id: 'brush', label: 'B', tip: 'Brush' },
  { id: 'ink', label: 'S', tip: 'Ink Bottle' },
  { id: 'rect', label: 'R', tip: 'Rectangle' },
  { id: 'ellipse', label: 'O', tip: 'Oval' },
  { id: 'line', label: 'N', tip: 'Line' },
  { id: 'text', label: 'T', tip: 'Text' },
  { id: 'paintBucket', label: 'K', tip: 'Paint Bucket' },
  { id: 'eyedropper', label: 'I', tip: 'Eyedropper' },
  { id: 'hand', label: 'H', tip: 'Hand' },
  { id: 'zoom', label: 'Z', tip: 'Zoom' },
]

export function Toolbar() {
  const { tool, setTool } = useEditor()
  return (
    <aside className="toolbar" aria-label="Tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tool-btn ${tool === t.id ? 'active' : ''}`}
          title={t.tip}
          onClick={() => setTool(t.id)}
        >
          <span className="tool-key">{t.label}</span>
          <span className="tool-name">{t.tip}</span>
        </button>
      ))}
    </aside>
  )
}
