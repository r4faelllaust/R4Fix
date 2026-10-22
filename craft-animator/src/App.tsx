import { ColorPanel } from './components/ColorPanel'
import { DocTabs } from './components/DocTabs'
import { DropOverlay } from './components/DropOverlay'
import { EditBar } from './components/EditBar'
import { FacePoseBar } from './components/FacePoseBar'
import { Launcher } from './components/Launcher'
import { LibraryPanel } from './components/Library'
import { Menubar } from './components/Menubar'
import { PropertiesPanel } from './components/Properties'
import { RigPanel } from './components/RigPanel'
import { Stage } from './components/Stage'
import { StatusBar } from './components/StatusBar'
import { Timeline } from './components/Timeline'
import { Toolbar } from './components/Toolbar'
import { EditorProvider, useEditor } from './store/EditorContext'
import './App.css'

function Workspace() {
  const { showWelcome, doc } = useEditor()
  const isMaple = !!doc.library.symbols['Maple/HeadAssembled']
  return (
    <div className="app-shell animate-shell">
      <Menubar />
      <DocTabs />
      <div className={`workspace ${showWelcome ? 'dimmed' : ''}`}>
        <Toolbar />
        <div className="center-column">
          <EditBar />
          <div className="stage-stack">
            {isMaple && <FacePoseBar />}
            <div className="stage-with-rulers">
              <div className="ruler corner" />
              <div className="ruler h-ruler" aria-hidden />
              <div className="ruler v-ruler" aria-hidden />
              <Stage />
            </div>
          </div>
          <Timeline />
        </div>
        <aside className="right-dock">
          <PropertiesPanel />
          <LibraryPanel />
          <RigPanel />
          <ColorPanel />
        </aside>
      </div>
      <StatusBar />
      <Launcher />
      <DropOverlay />
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
