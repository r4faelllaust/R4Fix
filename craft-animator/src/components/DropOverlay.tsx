import { useEffect, useState } from 'react'
import { useEditor } from '../store/EditorContext'

/** Full-window drop target for .fla / .xfl.zip / .caproj */
export function DropOverlay() {
  const { importFromFile, setStatus } = useEditor()
  const [active, setActive] = useState(false)

  useEffect(() => {
    let depth = 0
    const onEnter = (e: DragEvent) => {
      e.preventDefault()
      depth += 1
      setActive(true)
    }
    const onLeave = (e: DragEvent) => {
      e.preventDefault()
      depth = Math.max(0, depth - 1)
      if (depth === 0) setActive(false)
    }
    const onOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      depth = 0
      setActive(false)
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      setStatus(`Dropping ${file.name}…`)
      void importFromFile(file)
    }
    window.addEventListener('dragenter', onEnter)
    window.addEventListener('dragleave', onLeave)
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onEnter)
      window.removeEventListener('dragleave', onLeave)
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [importFromFile, setStatus])

  if (!active) return null
  return (
    <div className="drop-overlay">
      <div className="drop-card">
        <strong>Drop your rig</strong>
        <p>.fla · zipped XFL · .caproj.json</p>
      </div>
    </div>
  )
}
