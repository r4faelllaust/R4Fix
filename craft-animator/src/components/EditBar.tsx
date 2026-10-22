import { useEditor } from '../store/EditorContext'

/** Animate edit bar — scene / symbol breadcrumb above the Stage */
export function EditBar() {
  const { doc, selection, view, setView } = useEditor()
  const zoomPct = Math.round(view.zoom * 100)
  return (
    <div className="edit-bar">
      <div className="edit-bar-left">
        <button type="button" className="edit-crumb root">
          Scene 1
        </button>
        {selection.symbolEditPath.map((name) => (
          <span key={name} className="edit-crumb-wrap">
            <span className="edit-sep">▸</span>
            <button type="button" className="edit-crumb">
              {name}
            </button>
          </span>
        ))}
      </div>
      <div className="edit-bar-right">
        <label className="zoom-ctl">
          <select
            value={String(zoomPct)}
            onChange={(e) => {
              const z = Number(e.target.value) / 100
              setView((v) => ({ ...v, zoom: z }))
            }}
          >
            {[25, 50, 75, 100, 150, 200, 400].map((n) => (
              <option key={n} value={String(n)}>
                {n}%
              </option>
            ))}
            {![25, 50, 75, 100, 150, 200, 400].includes(zoomPct) && (
              <option value={String(zoomPct)}>{zoomPct}%</option>
            )}
          </select>
        </label>
        <span className="edit-meta">
          {doc.width} × {doc.height} px · {doc.frameRate} fps
        </span>
      </div>
    </div>
  )
}
