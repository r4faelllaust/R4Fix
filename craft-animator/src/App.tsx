import { ColorPanel } from './components/ColorPanel'
import { FacePoseBar } from './components/FacePoseBar'
import { Launcher } from './components/Launcher'
import { LibraryPanel } from './components/Library'
import { Menubar } from './components/Menubar'
import { PropertiesPanel } from './components/Properties'
import { Stage } from './components/Stage'
import { StatusBar } from './components/StatusBar'
import { Timeline } from './components/Timeline'
import { Toolbar } from './components/Toolbar'
import { EditorProvider, useEditor } from './store/EditorContext'
import './App.css'

function Workspace() {
  const { showWelcome } = useEditor()
  return (
    <div className="app-shell">
      <Menubar />
      <div className={`workspace ${showWelcome ? 'dimmed' : ''}`}>
        <Toolbar />
        <div className="center-column">
          <div className="stage-stack">
            <FacePoseBar />
            <Stage />
          </div>
          <Timeline />
        </div>
        <aside className="right-dock">
          <PropertiesPanel />
          <ColorPanel />
          <LibraryPanel />
        </aside>
      </div>
      <StatusBar />
      <Launcher />
    </div>
  )
}

export default function App() {
  return (
    <EditorProvider>
      <Workspace />
    </EditorProvider>
  )
}
