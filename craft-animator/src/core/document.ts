import { uid } from './id'
import { identity } from './matrix'
import type {
  Document,
  Frame,
  Layer,
  Library,
  ShapeElement,
  ShapePath,
  StageElement,
  SymbolItem,
  Timeline,
} from './types'

// StageElement used by elementsAtFrame

export function emptyLibrary(): Library {
  return { symbols: {}, bitmaps: {} }
}

export function makeFrame(
  index: number,
  elements: StageElement[] = [],
  duration = 1,
): Frame {
  return {
    index,
    duration,
    keyframe: true,
    elements,
  }
}

export function makeLayer(
  name: string,
  color = '#4fa3ff',
  frames: Frame[] = [makeFrame(0)],
): Layer {
  return {
    id: uid('layer'),
    name,
    color,
    visible: true,
    locked: false,
    layerType: 'normal',
    frames,
  }
}

export function makeTimeline(
  name = 'Scene 1',
  layers: Layer[] = [makeLayer('Layer_1')],
): Timeline {
  return { name, layers }
}

export function createBlankDocument(
  name = 'Untitled',
  width = 1280,
  height = 720,
): Document {
  return {
    version: 1,
    name,
    width,
    height,
    frameRate: 24,
    backgroundColor: '#c9dde8',
    timeline: makeTimeline(),
    library: emptyLibrary(),
    sourceFormat: 'caproj',
  }
}

export function shapeFromPaths(
  paths: ShapePath[],
  matrix = identity(),
  name?: string,
): ShapeElement {
  return {
    kind: 'shape',
    id: uid('el'),
    name,
    matrix,
    paths,
  }
}

export function ellipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke?: string,
  weight = 2,
): ShapePath {
  // Approximate ellipse with 4 quadratic curves
  const k = 0.5522847498
  const ox = rx * k
  const oy = ry * k
  return {
    fill: { color: fill },
    stroke: stroke ? { color: stroke, weight } : undefined,
    commands: [
      { type: 'move', x: cx + rx, y: cy },
      { type: 'quad', cx: cx + rx, cy: cy - oy, x: cx, y: cy - ry },
      { type: 'quad', cx: cx - ox, cy: cy - ry, x: cx - rx, y: cy },
      { type: 'quad', cx: cx - rx, cy: cy + oy, x: cx, y: cy + ry },
      { type: 'quad', cx: cx + ox, cy: cy + ry, x: cx + rx, y: cy },
      { type: 'close' },
    ],
  }
}

export function rectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke?: string,
  weight = 2,
  radius = 0,
): ShapePath {
  if (radius <= 0) {
    return {
      fill: { color: fill },
      stroke: stroke ? { color: stroke, weight } : undefined,
      commands: [
        { type: 'move', x, y },
        { type: 'line', x: x + w, y },
        { type: 'line', x: x + w, y: y + h },
        { type: 'line', x, y: y + h },
        { type: 'close' },
      ],
    }
  }
  const r = Math.min(radius, w / 2, h / 2)
  return {
    fill: { color: fill },
    stroke: stroke ? { color: stroke, weight } : undefined,
    commands: [
      { type: 'move', x: x + r, y },
      { type: 'line', x: x + w - r, y },
      { type: 'quad', cx: x + w, cy: y, x: x + w, y: y + r },
      { type: 'line', x: x + w, y: y + h - r },
      { type: 'quad', cx: x + w, cy: y + h, x: x + w - r, y: y + h },
      { type: 'line', x: x + r, y: y + h },
      { type: 'quad', cx: x, cy: y + h, x, y: y + h - r },
      { type: 'line', x, y: y + r },
      { type: 'quad', cx: x, cy: y, x: x + r, y },
      { type: 'close' },
    ],
  }
}

export function timelineLength(timeline: Timeline): number {
  let max = 1
  for (const layer of timeline.layers) {
    for (const frame of layer.frames) {
      max = Math.max(max, frame.index + frame.duration)
    }
  }
  return max
}

export function frameAt(layer: Layer, frameIndex: number): Frame | null {
  for (const frame of layer.frames) {
    if (
      frameIndex >= frame.index &&
      frameIndex < frame.index + frame.duration
    ) {
      return frame
    }
  }
  return null
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Elements at a frame, with simple motion-tween matrix interpolation. */
export function elementsAtFrame(
  layer: Layer,
  frameIndex: number,
): StageElement[] {
  const sorted = [...layer.frames].sort((a, b) => a.index - b.index)
  const current = frameAt(layer, frameIndex)
  if (!current) return []

  if (current.tweenType !== 'motion') {
    return current.elements
  }

  const next = sorted.find((f) => f.index > current.index)
  if (!next || !current.elements.length) return current.elements

  const span = next.index - current.index
  if (span <= 0) return current.elements
  const t = Math.min(1, Math.max(0, (frameIndex - current.index) / span))

  return current.elements.map((el, i) => {
    const target = next.elements[i] ?? next.elements[0]
    if (!target) return el
    const m = {
      a: lerp(el.matrix.a, target.matrix.a, t),
      b: lerp(el.matrix.b, target.matrix.b, t),
      c: lerp(el.matrix.c, target.matrix.c, t),
      d: lerp(el.matrix.d, target.matrix.d, t),
      tx: lerp(el.matrix.tx, target.matrix.tx, t),
      ty: lerp(el.matrix.ty, target.matrix.ty, t),
    }
    return { ...el, matrix: m, id: el.id }
  })
}

export function cloneDocument(doc: Document): Document {
  return structuredClone(doc)
}

export function upsertSymbol(library: Library, symbol: SymbolItem): void {
  library.symbols[symbol.name] = symbol
}

export function downloadJson(doc: Document, filename?: string): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `${doc.name || 'project'}.caproj.json`
  a.click()
  URL.revokeObjectURL(url)
}
