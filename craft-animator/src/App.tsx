import { FacePoseBar } from './components/FacePoseBar'
import { LibraryPanel } from './components/Library'
import { Menubar } from './components/Menubar'
import { PropertiesPanel } from './components/Properties'
import { Stage } from './components/Stage'
import { StatusBar } from './components/StatusBar'
import { Timeline } from './components/Timeline'
import { Toolbar } from './components/Toolbar'
import { Welcome } from './components/Welcome'
import { EditorProvider } from './store/EditorContext'
import './App.css'

function Workspace() {
  return (
    <div className="app-shell">
      <Menubar />
      <div className="workspace">
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
          <LibraryPanel />
        </aside>
      </div>
      <StatusBar />
      <Welcome />
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
