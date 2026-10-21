import { useEffect, useRef } from 'react'
import { frameAt } from '../core/document'
import { drawDocument } from '../render/drawDocument'
import { useEditor } from '../store/EditorContext'

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    doc,
    playback,
    view,
    setView,
    tool,
    selection,
    setSelection,
    selectedLayerId,
    setSelectedLayerId,
    nudgeSelection,
    rotateSelection,
  } = useEditor()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawDocument(ctx, doc, playback.currentFrame, view, {
        onionSkin: playback.onionSkin,
      })
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [doc, playback.currentFrame, playback.onionSkin, view])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return
      const step = e.shiftKey ? 10 : 1
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        nudgeSelection(-step, 0)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nudgeSelection(step, 0)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        nudgeSelection(0, -step)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        nudgeSelection(0, step)
      } else if (e.key === '[') {
        rotateSelection(-5)
      } else if (e.key === ']') {
        rotateSelection(5)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nudgeSelection, rotateSelection])

  const hitTest = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left - view.panX) / view.zoom
    const y = (clientY - rect.top - view.panY) / view.zoom

    for (const layer of doc.timeline.layers) {
      if (!layer.visible || layer.locked) continue
      const fr = frameAt(layer, playback.currentFrame)
      if (!fr) continue
      for (let i = fr.elements.length - 1; i >= 0; i--) {
        const el = fr.elements[i]
        if (!el) continue
        const dx = x - el.matrix.tx
        const dy = y - el.matrix.ty
        if (Math.hypot(dx, dy) < 80) {
          setSelectedLayerId(layer.id)
          setSelection({
            layerId: layer.id,
            elementIds: [el.id],
            symbolEditPath: [],
          })
          return
        }
      }
    }
    setSelection({ layerId: selectedLayerId, elementIds: [], symbolEditPath: [] })
  }

  return (
    <div className="stage-wrap">
      <canvas
        ref={canvasRef}
        className="stage-canvas"
        onPointerDown={(e) => {
          if (tool === 'hand') return
          if (tool === 'zoom') {
            setView((v) => ({
              ...v,
              zoom: Math.min(4, Math.max(0.2, v.zoom * (e.altKey ? 0.8 : 1.25))),
            }))
            return
          }
          hitTest(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (tool !== 'hand' || e.buttons !== 1) return
          setView((v) => ({
            ...v,
            panX: v.panX + e.movementX,
            panY: v.panY + e.movementY,
          }))
        }}
        onWheel={(e) => {
          e.preventDefault()
          const factor = e.deltaY > 0 ? 0.9 : 1.1
          setView((v) => ({
            ...v,
            zoom: Math.min(4, Math.max(0.2, v.zoom * factor)),
          }))
        }}
      />
      {selection.elementIds.length > 0 && (
        <div className="stage-hint">
          Selected · arrows nudge · [ ] rotate · use Properties for face frames
        </div>
      )}
    </div>
  )
}
