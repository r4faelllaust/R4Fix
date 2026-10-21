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
    frameRef,
    playingRef,
    drawGenRef,
  } = useEditor()

  const docRef = useRef(doc)
  const viewRef = useRef(view)
  const onionRef = useRef(playback.onionSkin)
  docRef.current = doc
  viewRef.current = view
  onionRef.current = playback.onionSkin

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    let raf = 0
    let lastFrame = -1
    let lastGen = -1
    let lastZoom = -1
    let lastPanX = NaN
    let lastPanY = NaN
    let dprCached = 0
    let wCached = 0
    let hCached = 0

    const ensureSize = (ctx: CanvasRenderingContext2D) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = parent.clientWidth
      const h = parent.clientHeight
      if (dpr !== dprCached || w !== wCached || h !== hCached) {
        dprCached = dpr
        wCached = w
        hCached = h
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        ;(ctx as CanvasRenderingContext2D & { __dpr?: number }).__dpr = dpr
        lastFrame = -1
      }
    }

    const tick = () => {
      const ctx = canvas.getContext('2d', { alpha: false })
      if (ctx) {
        ensureSize(ctx)
        const frame = frameRef.current
        const gen = drawGenRef.current
        const v = viewRef.current
        const dirty =
          frame !== lastFrame ||
          gen !== lastGen ||
          v.zoom !== lastZoom ||
          v.panX !== lastPanX ||
          v.panY !== lastPanY
        if (dirty) {
          drawDocument(ctx, docRef.current, frame, v, {
            onionSkin: onionRef.current,
            fast: playingRef.current,
          })
          lastFrame = frame
          lastGen = gen
          lastZoom = v.zoom
          lastPanX = v.panX
          lastPanY = v.panY
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    const ro = new ResizeObserver(() => {
      lastFrame = -1
    })
    ro.observe(parent)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [frameRef, playingRef, drawGenRef])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
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
      } else if (e.key === ' ') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('craft-toggle-play'))
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
    const frame = frameRef.current

    for (const layer of doc.timeline.layers) {
      if (!layer.visible || layer.locked) continue
      const fr = frameAt(layer, frame)
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
    setSelection({
      layerId: selectedLayerId,
      elementIds: [],
      symbolEditPath: [],
    })
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
              zoom: Math.min(
                4,
                Math.max(0.2, v.zoom * (e.altKey ? 0.8 : 1.25)),
              ),
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
          Selected · arrows nudge · [ ] rotate · Space play/pause
        </div>
      )}
    </div>
  )
}
