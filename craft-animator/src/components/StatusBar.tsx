import { useEditor } from '../store/EditorContext'

export function StatusBar() {
  const { status, warnings, doc } = useEditor()
  return (
    <footer className="statusbar">
      <span className="status-main">{status}</span>
      <span className="status-meta">
        {doc.width}×{doc.height} · {Object.keys(doc.library.symbols).length}{' '}
        symbols
      </span>
      {warnings[0] && (
        <span className="status-warn" title={warnings.join('\n')}>
          {warnings[0]}
        </span>
      )}
    </footer>
  )
}
