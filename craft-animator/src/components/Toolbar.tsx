import type { ToolId } from '../core/types'
import { useEditor } from '../store/EditorContext'

const TOOLS: { id: ToolId; tip: string; group?: boolean; icon: string }[] = [
  { id: 'select', tip: 'Selection Tool (V)', icon: 'cursor' },
  { id: 'freeTransform', tip: 'Free Transform (Q)', icon: 'transform' },
  { id: 'bone', tip: 'Bone Tool (M)', icon: 'bone', group: true },
  { id: 'pencil', tip: 'Pencil Tool (Y)', icon: 'pencil' },
  { id: 'brush', tip: 'Brush Tool (B)', icon: 'brush' },
  { id: 'ink', tip: 'Ink Bottle (S)', icon: 'ink' },
  { id: 'paintBucket', tip: 'Paint Bucket (K)', icon: 'bucket' },
  { id: 'eyedropper', tip: 'Eyedropper (I)', icon: 'dropper', group: true },
  { id: 'rect', tip: 'Rectangle (R)', icon: 'rect' },
  { id: 'ellipse', tip: 'Oval (O)', icon: 'oval' },
  { id: 'line', tip: 'Line (N)', icon: 'line' },
  { id: 'polyStar', tip: 'PolyStar', icon: 'star' },
  { id: 'text', tip: 'Text (T)', icon: 'text', group: true },
  { id: 'hand', tip: 'Hand (H)', icon: 'hand' },
  { id: 'zoom', tip: 'Zoom (Z)', icon: 'zoom' },
]

function ToolIcon({ name }: { name: string }) {
  switch (name) {
    case 'cursor':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M3 2v12l3.5-3.5L9.5 14l1.5-.8-3-3.7L12 9.2z" />
        </svg>
      )
    case 'transform':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <rect x="3" y="3" width="10" height="10" fill="none" stroke="currentColor" strokeDasharray="2 1" />
          <rect x="2" y="2" width="2" height="2" fill="currentColor" />
          <rect x="12" y="2" width="2" height="2" fill="currentColor" />
          <rect x="2" y="12" width="2" height="2" fill="currentColor" />
          <rect x="12" y="12" width="2" height="2" fill="currentColor" />
        </svg>
      )
    case 'bone':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <circle cx="4" cy="4" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M5.5 5.5 L10.5 10.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'pencil':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M11.5 1.5l3 3L6 13H3v-3z" />
        </svg>
      )
    case 'brush':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M9 2l5 5-6 6H5l-.5-2.5zM3 12c0 2 1.5 3 3 2" />
        </svg>
      )
    case 'ink':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M5 2h6v3l-2 2v5H7V7L5 5z" />
        </svg>
      )
    case 'bucket':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M2 6l4-4 8 8-2 2H6z" />
        </svg>
      )
    case 'dropper':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M11 2l3 3-7 7H4v-3z" />
        </svg>
      )
    case 'rect':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <rect x="3" y="4" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'oval':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <ellipse cx="8" cy="8" rx="5.5" ry="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'line':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path d="M3 13 L13 3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M8 2l1.5 4.5H14l-3.5 2.5L12 14 8 11.5 4 14l1.5-5L2 6.5h4.5z" />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M3 3h10v2H9v8H7V5H3z" />
        </svg>
      )
    case 'hand':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path fill="currentColor" d="M6 2v6H5V4H3v7l3 3h6V7h-1V3H9v4H8V2z" />
        </svg>
      )
    case 'zoom':
      return (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <circle cx="7" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10 L14 14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    default:
      return <span>•</span>
  }
}

export function Toolbar() {
  const { tool, setTool } = useEditor()
  return (
    <aside className="toolbar animate-toolbar" aria-label="Tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tool-btn ${tool === t.id ? 'active' : ''} ${t.group ? 'group-end' : ''}`}
          title={t.tip}
          onClick={() => setTool(t.id)}
        >
          <ToolIcon name={t.icon} />
        </button>
      ))}
      <div className="tool-colors">
        <button type="button" className="swatch stroke" title="Stroke" aria-label="Stroke color" />
        <button type="button" className="swatch fill" title="Fill" aria-label="Fill color" />
      </div>
    </aside>
  )
}
