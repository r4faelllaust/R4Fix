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
const IDENTITY: Matrix2D = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }

function getImage(dataUrl: string): HTMLImageElement | null {
  const cached = imageCache.get(dataUrl)
  if (cached) return cached
  const img = new Image()
  img.src = dataUrl
  imageCache.set(dataUrl, img)
  return img
}

function drawPath(ctx: CanvasRenderingContext2D, path: ShapePath): void {
  const cmds = path.commands
  if (!cmds.length) return
  ctx.beginPath()
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i]!
    if (cmd.type === 'move') ctx.moveTo(cmd.x, cmd.y)
    else if (cmd.type === 'line') ctx.lineTo(cmd.x, cmd.y)
    else if (cmd.type === 'quad')
      ctx.quadraticCurveTo(cmd.cx, cmd.cy, cmd.x, cmd.y)
    else if (cmd.type === 'close') ctx.closePath()
  }
  if (path.fill) {
    const a = path.fill.alpha
    if (a != null && a !== 1) ctx.globalAlpha = a
    ctx.fillStyle = path.fill.color
    ctx.fill()
    if (a != null && a !== 1) ctx.globalAlpha = 1
  }
  if (path.stroke) {
    const a = path.stroke.alpha
    if (a != null && a !== 1) ctx.globalAlpha = a
    ctx.strokeStyle = path.stroke.color
    ctx.lineWidth = path.stroke.weight
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()
    if (a != null && a !== 1) ctx.globalAlpha = 1
  }
}

function resolveSymbol(library: Library, name: string) {
  return (
    library.symbols[name] ||
    Object.values(library.symbols).find(
      (s) =>
        s.name === name ||
        s.name.endsWith(`/${name}`) ||
        s.name.split('/').pop() === name.split('/').pop(),
    )
  )
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  el: StageElement,
  library: Library,
  frame: number,
  parent: Matrix2D,
  depth: number,
): void {
  if (depth > 24) return
  ctx.save()
  const m =
    parent === IDENTITY || (parent.a === 1 && parent.b === 0 && parent.c === 0 && parent.d === 1 && parent.tx === 0 && parent.ty === 0)
      ? el.matrix
      : multiply(parent, el.matrix)
  applyToCanvas(ctx, m)
  if (el.color?.alphaMultiplier != null && el.color.alphaMultiplier !== 1) {
    ctx.globalAlpha *= el.color.alphaMultiplier
  }

  if (el.kind === 'shape') {
    for (let i = 0; i < el.paths.length; i++) drawPath(ctx, el.paths[i]!)
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
    const sym = resolveSymbol(library, el.libraryItemName)
    if (!sym) {
      ctx.strokeStyle = '#f0a05a'
      ctx.strokeRect(-20, -20, 40, 40)
    } else {
      let localFrame = el.firstFrame ?? 0
      if (el.loop === 'loop' || !el.loop) localFrame = frame
      drawTimeline(ctx, sym.timeline, library, localFrame, IDENTITY, depth + 1)
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
  const layers = timeline.layers
  for (let li = layers.length - 1; li >= 0; li--) {
    const layer = layers[li]!
    if (!layer.visible || layer.layerType === 'guide' || layer.layerType === 'folder')
      continue
    const els = elementsAtFrame(layer, frame)
    for (let i = 0; i < els.length; i++) {
      drawElement(ctx, els[i]!, library, frame, parent, depth)
    }
  }
}

export function drawDocument(
  ctx: CanvasRenderingContext2D,
  doc: Document,
  frame: number,
  view: { zoom: number; panX: number; panY: number },
  opts?: { onionSkin?: boolean; fast?: boolean },
): void {
  const { width, height } = ctx.canvas
  const dpr = (ctx as CanvasRenderingContext2D & { __dpr?: number }).__dpr || 1
  const cssW = width / dpr
  const cssH = height / dpr

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (opts?.fast) {
    ctx.fillStyle = '#12151b'
    ctx.fillRect(0, 0, cssW, cssH)
  } else {
    ctx.clearRect(0, 0, cssW, cssH)
    ctx.fillStyle = '#12151b'
    ctx.fillRect(0, 0, cssW, cssH)
  }

  ctx.save()
  ctx.translate(view.panX, view.panY)
  ctx.scale(view.zoom, view.zoom)

  if (!opts?.fast) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(6, 6, doc.width, doc.height)
  }
  ctx.fillStyle = doc.backgroundColor
  ctx.fillRect(0, 0, doc.width, doc.height)

  if (opts?.onionSkin && frame > 0) {
    ctx.globalAlpha = 0.25
    drawTimeline(ctx, doc.timeline, doc.library, frame - 1, IDENTITY)
    ctx.globalAlpha = 1
  }

  drawTimeline(ctx, doc.timeline, doc.library, frame, IDENTITY)

  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1 / view.zoom
  ctx.strokeRect(0, 0, doc.width, doc.height)
  ctx.restore()
}
