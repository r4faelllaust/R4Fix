import { elementsAtFrame } from '../core/document'
import { applyToCanvas, multiply } from '../core/matrix'
import type {
  Document,
  Library,
  Matrix2D,
  ShapePath,
  StageElement,
  Timeline,
} from '../core/types'

const imageCache = new Map<string, HTMLImageElement>()

function getImage(dataUrl: string): HTMLImageElement | null {
  const cached = imageCache.get(dataUrl)
  if (cached) return cached
  const img = new Image()
  img.src = dataUrl
  imageCache.set(dataUrl, img)
  return img
}

function drawPath(ctx: CanvasRenderingContext2D, path: ShapePath): void {
  if (!path.commands.length) return
  ctx.beginPath()
  for (const cmd of path.commands) {
    if (cmd.type === 'move') ctx.moveTo(cmd.x, cy(cmd.y))
    else if (cmd.type === 'line') ctx.lineTo(cmd.x, cy(cmd.y))
    else if (cmd.type === 'quad')
      ctx.quadraticCurveTo(cmd.cx, cy(cmd.cy), cmd.x, cy(cmd.y))
    else if (cmd.type === 'close') ctx.closePath()
  }
  if (path.fill) {
    ctx.globalAlpha = path.fill.alpha ?? 1
    ctx.fillStyle = path.fill.color
    ctx.fill()
  }
  if (path.stroke) {
    ctx.globalAlpha = path.stroke.alpha ?? 1
    ctx.strokeStyle = path.stroke.color
    ctx.lineWidth = path.stroke.weight
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// identity helper kept for readability if we flip Y later
function cy(y: number): number {
  return y
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  el: StageElement,
  library: Library,
  frame: number,
  parent: Matrix2D,
  depth: number,
): void {
  if (depth > 32) return
  ctx.save()
  applyToCanvas(ctx, multiply(parent, el.matrix))
  if (el.color?.alphaMultiplier != null) {
    ctx.globalAlpha *= el.color.alphaMultiplier
  }

  if (el.kind === 'shape') {
    for (const p of el.paths) drawPath(ctx, p)
  } else if (el.kind === 'text') {
    ctx.fillStyle = el.color
    ctx.font = `${el.fontSize}px ${el.fontFamily ?? 'Outfit, sans-serif'}`
    ctx.fillText(el.text, 0, 0)
  } else if (el.kind === 'bitmap') {
    const bmp = library.bitmaps[el.libraryItemName]
    if (bmp?.dataUrl) {
      const img = getImage(bmp.dataUrl)
      if (img?.complete) {
        ctx.drawImage(img, 0, 0, el.width || bmp.width, el.height || bmp.height)
      }
    } else {
      ctx.fillStyle = '#666'
      ctx.fillRect(0, 0, el.width, el.height)
    }
  } else if (el.kind === 'symbol') {
    const sym = library.symbols[el.libraryItemName]
    if (!sym) {
      // try fuzzy match by basename
      const hit = Object.values(library.symbols).find(
        (s) =>
          s.name === el.libraryItemName ||
          s.name.endsWith(`/${el.libraryItemName}`) ||
          s.name.split('/').pop() === el.libraryItemName.split('/').pop(),
      )
      if (hit) {
        drawTimeline(
          ctx,
          hit.timeline,
          library,
          el.firstFrame ?? 0,
          { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
          depth + 1,
        )
      } else {
        ctx.strokeStyle = '#f0a05a'
        ctx.strokeRect(-20, -20, 40, 40)
        ctx.fillStyle = '#f0a05a'
        ctx.font = '10px Outfit, sans-serif'
        ctx.fillText(el.libraryItemName.slice(0, 18), -18, 0)
      }
    } else {
      let localFrame = el.firstFrame ?? 0
      if (el.loop === 'loop' || !el.loop) {
        localFrame = frame
      } else if (el.loop === 'single frame') {
        localFrame = el.firstFrame ?? 0
      }
      drawTimeline(
        ctx,
        sym.timeline,
        library,
        localFrame,
        { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
        depth + 1,
      )
    }
  }
  ctx.restore()
}

export function drawTimeline(
  ctx: CanvasRenderingContext2D,
  timeline: Timeline,
  library: Library,
  frame: number,
  parent: Matrix2D,
  depth = 0,
): void {
  // Draw bottom layer first (Animate: top of list is front — reverse)
  const layers = [...timeline.layers].reverse()
  for (const layer of layers) {
    if (!layer.visible || layer.layerType === 'guide' || layer.layerType === 'folder')
      continue
    const els = elementsAtFrame(layer, frame)
    for (const el of els) {
      drawElement(ctx, el, library, frame, parent, depth)
    }
  }
}

export function drawDocument(
  ctx: CanvasRenderingContext2D,
  doc: Document,
  frame: number,
  view: { zoom: number; panX: number; panY: number },
  opts?: { onionSkin?: boolean },
): void {
  const { width, height } = ctx.canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, width, height)

  // Workspace atmosphere
  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, '#1a1f27')
  grad.addColorStop(1, '#12151b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(view.panX, view.panY)
  ctx.scale(view.zoom, view.zoom)

  // Stage shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(6, 6, doc.width, doc.height)
  ctx.fillStyle = doc.backgroundColor
  ctx.fillRect(0, 0, doc.width, doc.height)

  if (opts?.onionSkin && frame > 0) {
    ctx.globalAlpha = 0.25
    drawTimeline(
      ctx,
      doc.timeline,
      doc.library,
      frame - 1,
      { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
    )
    ctx.globalAlpha = 1
  }

  drawTimeline(
    ctx,
    doc.timeline,
    doc.library,
    frame,
    { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
  )

  // Stage border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1 / view.zoom
  ctx.strokeRect(0, 0, doc.width, doc.height)
  ctx.restore()
}
