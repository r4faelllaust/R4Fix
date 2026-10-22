import { useEditor } from '../store/EditorContext'

/** Adobe Animate–style document tabs under the menu bar */
export function DocTabs() {
  const { doc, setShowWelcome, openRigPicker } = useEditor()
  return (
    <div className="doc-tabs-bar">
      <div className="doc-tabs">
        <div className="doc-tab-item active">
          <span className="doc-tab-icon" aria-hidden />
          <span>{doc.name}.fla</span>
          <button
            type="button"
            className="doc-tab-close"
            title="Close"
            onClick={() => setShowWelcome(true)}
          >
            ×
          </button>
        </div>
        <button
          type="button"
          className="doc-tab-add"
          title="Open Rig"
          onClick={() => void openRigPicker()}
        >
          +
        </button>
      </div>
      <div className="workspace-switcher" title="Workspace">
        Essentials
        <span aria-hidden>▾</span>
      </div>
    </div>
  )
}
