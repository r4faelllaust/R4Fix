import JSZip from 'jszip'
import {
  createBlankDocument,
  makeFrame,
  makeLayer,
  makeTimeline,
  upsertSymbol,
} from '../core/document'
import { identity } from '../core/matrix'
import { uid } from '../core/id'
import type {
  BitmapItem,
  Document,
  Frame,
  Layer,
  Matrix2D,
  ShapePath,
  StageElement,
  SymbolItem,
  Timeline,
} from '../core/types'
import { looksLikeTwips, parseEdgeData } from './parseEdges'

function attr(el: Element | null, name: string, fallback = ''): string {
  return el?.getAttribute(name) ?? fallback
}

function numAttr(el: Element | null, name: string, fallback = 0): number {
  const v = el?.getAttribute(name)
  if (v == null || v === '') return fallback
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

function boolAttr(el: Element | null, name: string, fallback = true): boolean {
  const v = el?.getAttribute(name)
  if (v == null) return fallback
  return v === 'true'
}

function parseMatrix(parent: Element | null): Matrix2D {
  const matrixEl =
    parent?.getElementsByTagName('Matrix')[0] ??
    parent?.querySelector('matrix Matrix')
  if (!matrixEl) return identity()
  return {
    a: numAttr(matrixEl, 'a', 1),
    b: numAttr(matrixEl, 'b', 0),
    c: numAttr(matrixEl, 'c', 0),
    d: numAttr(matrixEl, 'd', 1),
    tx: numAttr(matrixEl, 'tx', 0),
    ty: numAttr(matrixEl, 'ty', 0),
  }
}

function parseColor(parent: Element | null) {
  const colorEl = parent?.getElementsByTagName('Color')[0]
  if (!colorEl) return undefined
  return {
    alphaMultiplier: numAttr(colorEl, 'alphaMultiplier', 1),
    redMultiplier: numAttr(colorEl, 'redMultiplier', 1),
    greenMultiplier: numAttr(colorEl, 'greenMultiplier', 1),
    blueMultiplier: numAttr(colorEl, 'blueMultiplier', 1),
    alphaOffset: numAttr(colorEl, 'alphaOffset', 0),
    redOffset: numAttr(colorEl, 'redOffset', 0),
    greenOffset: numAttr(colorEl, 'greenOffset', 0),
    blueOffset: numAttr(colorEl, 'blueOffset', 0),
  }
}

function fillColorFromSolid(solid: Element | null): string {
  if (!solid) return '#888888'
  return attr(solid, 'color', '#888888')
}

function parseShapeElement(shapeEl: Element): StageElement | null {
  const paths: ShapePath[] = []
  const fills = Array.from(shapeEl.getElementsByTagName('FillStyle'))
  const strokes = Array.from(shapeEl.getElementsByTagName('StrokeStyle'))
  const edges = Array.from(shapeEl.getElementsByTagName('Edge'))

  const fillMap = new Map<number, { color: string; alpha: number }>()
  for (const f of fills) {
    const idx = numAttr(f, 'index', 1)
    const solid = f.getElementsByTagName('SolidColor')[0]
    fillMap.set(idx, {
      color: fillColorFromSolid(solid),
      alpha: numAttr(solid, 'alpha', 1),
    })
  }

  const strokeMap = new Map<
    number,
    { color: string; weight: number; alpha: number }
  >()
  for (const s of strokes) {
    const idx = numAttr(s, 'index', 1)
    const solid = s.querySelector('SolidStroke SolidColor, SolidColor')
    const solidStroke = s.getElementsByTagName('SolidStroke')[0]
    strokeMap.set(idx, {
      color: fillColorFromSolid(solid),
      weight: numAttr(solidStroke, 'weight', 1),
      alpha: numAttr(solid, 'alpha', 1),
    })
  }

  for (const edge of edges) {
    const edgesAttr = attr(edge, 'edges')
    if (!edgesAttr) continue
    const twips = looksLikeTwips(edgesAttr)
    const commands = parseEdgeData(edgesAttr, twips)
    if (!commands.length) continue

    const fillLeft = numAttr(edge, 'fillStyle0', 0) || numAttr(edge, 'fillStyle1', 0)
    const strokeIdx = numAttr(edge, 'strokeStyle', 0)
    const fill = fillLeft ? fillMap.get(fillLeft) : undefined
    const stroke = strokeIdx ? strokeMap.get(strokeIdx) : undefined

    paths.push({
      fill: fill
        ? { color: fill.color, alpha: fill.alpha }
        : undefined,
      stroke: stroke
        ? { color: stroke.color, weight: stroke.weight, alpha: stroke.alpha }
        : undefined,
      commands,
    })
  }

  // Fallback: if no edges parsed but fills exist, draw a placeholder rect
  if (!paths.length && fills.length) {
    const solid = fills[0]?.getElementsByTagName('SolidColor')[0]
    paths.push({
      fill: { color: fillColorFromSolid(solid) },
      commands: [
        { type: 'move', x: -20, y: -20 },
        { type: 'line', x: 20, y: -20 },
        { type: 'line', x: 20, y: 20 },
        { type: 'line', x: -20, y: 20 },
        { type: 'close' },
      ],
    })
  }

  if (!paths.length) return null

  return {
    kind: 'shape',
    id: uid('el'),
    matrix: parseMatrix(shapeEl),
    color: parseColor(shapeEl),
    paths,
  }
}

function parseElements(container: Element | null): StageElement[] {
  if (!container) return []
  const out: StageElement[] = []
  for (const child of Array.from(container.children)) {
    const tag = child.tagName
    if (tag === 'DOMSymbolInstance') {
      const typeAttr = attr(child, 'symbolType', '')
      const symbolType =
        typeAttr === 'graphic'
          ? 'graphic'
          : typeAttr === 'button'
            ? 'button'
            : 'movieClip'
      out.push({
        kind: 'symbol',
        id: uid('el'),
        name: attr(child, 'name') || undefined,
        libraryItemName: attr(child, 'libraryItemName'),
        symbolType,
        firstFrame: numAttr(child, 'firstFrame', 0),
        loop: (attr(child, 'loop', 'loop') as 'loop' | 'play once' | 'single frame') ||
          'loop',
        matrix: parseMatrix(child),
        color: parseColor(child),
      })
    } else if (tag === 'DOMBitmapInstance') {
      out.push({
        kind: 'bitmap',
        id: uid('el'),
        libraryItemName: attr(child, 'libraryItemName'),
        matrix: parseMatrix(child),
        color: parseColor(child),
        width: 100,
        height: 100,
      })
    } else if (tag === 'DOMShape' || tag === 'DOMRectangleObject' || tag === 'DOMOvalObject') {
      if (tag === 'DOMRectangleObject') {
        const x = numAttr(child, 'x', 0)
        const y = numAttr(child, 'y', 0)
        const w = numAttr(child, 'objectWidth', 40)
        const h = numAttr(child, 'objectHeight', 40)
        const fill = child.querySelector('SolidColor')
        out.push({
          kind: 'shape',
          id: uid('el'),
          matrix: parseMatrix(child),
          paths: [
            {
              fill: { color: fillColorFromSolid(fill) },
              commands: [
                { type: 'move', x, y },
                { type: 'line', x: x + w, y },
                { type: 'line', x: x + w, y: y + h },
                { type: 'line', x, y: y + h },
                { type: 'close' },
              ],
            },
          ],
        })
      } else if (tag === 'DOMOvalObject') {
        const x = numAttr(child, 'x', 0)
        const y = numAttr(child, 'y', 0)
        const w = numAttr(child, 'objectWidth', 40)
        const h = numAttr(child, 'objectHeight', 40)
        const fill = child.querySelector('SolidColor')
        const cx = x + w / 2
        const cy = y + h / 2
        const rx = w / 2
        const ry = h / 2
        const k = 0.5522847498
        out.push({
          kind: 'shape',
          id: uid('el'),
          matrix: parseMatrix(child),
          paths: [
            {
              fill: { color: fillColorFromSolid(fill) },
              commands: [
                { type: 'move', x: cx + rx, y: cy },
                {
                  type: 'quad',
                  cx: cx + rx,
                  cy: cy - ry * k,
                  x: cx,
                  y: cy - ry,
                },
                {
                  type: 'quad',
                  cx: cx - rx * k,
                  cy: cy - ry,
                  x: cx - rx,
                  y: cy,
                },
                {
                  type: 'quad',
                  cx: cx - rx,
                  cy: cy + ry * k,
                  x: cx,
                  y: cy + ry,
                },
                {
                  type: 'quad',
                  cx: cx + rx * k,
                  cy: cy + ry,
                  x: cx + rx,
                  y: cy,
                },
                { type: 'close' },
              ],
            },
          ],
        })
      } else {
        const shape = parseShapeElement(child)
        if (shape) out.push(shape)
      }
    } else if (tag === 'DOMStaticText' || tag === 'DOMDynamicText') {
      const textRuns = Array.from(child.getElementsByTagName('DOMTextRun'))
      const text = textRuns
        .map((r) => r.getElementsByTagName('characters')[0]?.textContent ?? '')
        .join('')
      const attrs = child.getElementsByTagName('DOMTextAttrs')[0]
      out.push({
        kind: 'text',
        id: uid('el'),
        matrix: parseMatrix(child),
        text: text || 'Text',
        fontSize: numAttr(attrs, 'size', 14),
        color: attr(attrs, 'fillColor', '#000000'),
        fontFamily: attr(attrs, 'face', 'Arial'),
      })
    } else if (tag === 'DOMGroup' || tag === 'DOMLayer') {
      // Groups wrap elements
      const els = child.getElementsByTagName('elements')[0]
      out.push(...parseElements(els ?? child))
    }
  }
  return out
}

function parseFrames(layerEl: Element): Frame[] {
  const frames: Frame[] = []
  const frameEls = Array.from(layerEl.getElementsByTagName('DOMFrame'))
  for (const f of frameEls) {
    // Only direct-ish frames under this layer's frames container
    if (f.parentElement?.tagName !== 'frames' && f.parentElement?.parentElement?.tagName !== 'DOMLayer') {
      // still accept
    }
    const elementsEl = f.getElementsByTagName('elements')[0]
    frames.push({
      index: numAttr(f, 'index', 0),
      duration: numAttr(f, 'duration', 1),
      keyframe: true,
      tweenType: (attr(f, 'tweenType', 'none') as Frame['tweenType']) || 'none',
      label: attr(f, 'name') || undefined,
      elements: parseElements(elementsEl),
    })
  }
  // de-dupe by index (nested DOMFrame noise)
  const byIndex = new Map<number, Frame>()
  for (const fr of frames) {
    if (!byIndex.has(fr.index)) byIndex.set(fr.index, fr)
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index)
}

function parseTimeline(timelineEl: Element | null, fallbackName: string): Timeline {
  if (!timelineEl) return makeTimeline(fallbackName)
  const name = attr(timelineEl, 'name', fallbackName)
  const layerEls = Array.from(timelineEl.getElementsByTagName('DOMLayer'))
  // Only top-level layers under this timeline's layers node
  const layersNode = timelineEl.getElementsByTagName('layers')[0]
  const topLayers = layersNode
    ? Array.from(layersNode.children).filter((c) => c.tagName === 'DOMLayer')
    : layerEls

  const layers: Layer[] = topLayers.map((layerEl, i) => {
    const frames = parseFrames(layerEl)
    return {
      id: uid('layer'),
      name: attr(layerEl, 'name', `Layer_${i + 1}`),
      color: attr(layerEl, 'color', '#4fa3ff'),
      visible: boolAttr(layerEl, 'visible', true),
      locked: boolAttr(layerEl, 'locked', false),
      layerType: (attr(layerEl, 'layerType', 'normal') as Layer['layerType']) ||
        'normal',
      frames: frames.length ? frames : [makeFrame(0)],
    }
  })

  return {
    name,
    layers: layers.length ? layers : [makeLayer('Layer_1')],
  }
}

function parseSymbolXml(xml: string, hrefHint: string): SymbolItem | null {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const root = doc.getElementsByTagName('DOMSymbolItem')[0]
  if (!root) return null
  const name =
    attr(root, 'name') ||
    hrefHint.replace(/^LIBRARY\//, '').replace(/\.xml$/i, '')
  const typeAttr = attr(root, 'symbolType', 'movie clip')
  const symbolType =
    typeAttr.includes('graphic')
      ? 'graphic'
      : typeAttr.includes('button')
        ? 'button'
        : 'movieClip'
  const timelineEl = root.getElementsByTagName('DOMTimeline')[0]
  return {
    name,
    symbolType,
    timeline: parseTimeline(timelineEl, name),
  }
}

async function readText(
  zip: JSZip,
  path: string,
): Promise<string | null> {
  const file = zip.file(path) ?? zip.file(path.replace(/^\//, ''))
  if (!file) {
    // case-insensitive search
    const lower = path.toLowerCase()
    const match = Object.keys(zip.files).find((k) => k.toLowerCase() === lower)
    if (!match) return null
    return zip.file(match)!.async('string')
  }
  return file.async('string')
}

function findDomDocumentPath(zip: JSZip): string | null {
  const keys = Object.keys(zip.files)
  const exact = keys.find((k) => /(^|\/)DOMDocument\.xml$/i.test(k))
  return exact ?? null
}

async function loadBitmaps(
  zip: JSZip,
  dom: Document,
  mediaNodes: Element[],
): Promise<void> {
  for (const media of mediaNodes) {
    if (media.tagName !== 'DOMBitmapItem') continue
    const name = attr(media, 'name')
    const href = attr(media, 'href') || attr(media, 'bitmapDataHRef')
    if (!name) continue
    let dataUrl: string | undefined
    let width = numAttr(media, 'frameRight', 0) / 20 || 100
    let height = numAttr(media, 'frameBottom', 0) / 20 || 100

    if (href) {
      const candidates = [
        href,
        `LIBRARY/${href}`,
        `bin/${href}`,
        href.replace(/^LIBRARY\//, ''),
      ]
      for (const c of candidates) {
        const file =
          zip.file(c) ||
          Object.keys(zip.files)
            .filter((k) => k.toLowerCase().endsWith(c.toLowerCase().split('/').pop()!))
            .map((k) => zip.file(k))[0]
        if (file && !file.dir) {
          const buf = await file.async('base64')
          const ext = c.split('.').pop()?.toLowerCase()
          const mime =
            ext === 'jpg' || ext === 'jpeg'
              ? 'image/jpeg'
              : ext === 'gif'
                ? 'image/gif'
                : 'image/png'
          dataUrl = `data:${mime};base64,${buf}`
          break
        }
      }
    }

    const item: BitmapItem = { name, href: href || name, dataUrl, width, height }
    dom.library.bitmaps[name] = item
  }
}

export type ImportResult = {
  document: Document
  warnings: string[]
}

export async function importFlaOrXflZip(
  data: ArrayBuffer,
  fileName: string,
): Promise<ImportResult> {
  const warnings: string[] = []
  const zip = await JSZip.loadAsync(data)
  const domPath = findDomDocumentPath(zip)
  if (!domPath) {
    throw new Error(
      'No DOMDocument.xml found. Export as .fla or uncompressed .xfl from Adobe Animate.',
    )
  }

  const domXml = await readText(zip, domPath)
  if (!domXml) throw new Error('Could not read DOMDocument.xml')

  const xml = new DOMParser().parseFromString(domXml, 'application/xml')
  const root = xml.getElementsByTagName('DOMDocument')[0]
  if (!root) throw new Error('Invalid DOMDocument.xml')

  const doc = createBlankDocument(
    fileName.replace(/\.(fla|xfl|zip)$/i, '') || 'Imported',
    numAttr(root, 'width', 550),
    numAttr(root, 'height', 400),
  )
  doc.frameRate = numAttr(root, 'frameRate', 24)
  doc.backgroundColor = attr(root, 'backgroundColor', '#ffffff')
  doc.sourceFormat = fileName.toLowerCase().endsWith('.fla') ? 'fla' : 'xfl'

  // Media
  const mediaParent = root.getElementsByTagName('media')[0]
  if (mediaParent) {
    await loadBitmaps(zip, doc, Array.from(mediaParent.children))
  }

  // Symbols
  const includes = Array.from(root.getElementsByTagName('Include'))
  const libraryFolder = domPath.includes('/')
    ? domPath.replace(/DOMDocument\.xml$/i, 'LIBRARY/')
    : 'LIBRARY/'

  for (const inc of includes) {
    const href = attr(inc, 'href')
    if (!href) continue
    const candidates = [
      `${libraryFolder}${href}`,
      `LIBRARY/${href}`,
      href,
      href.startsWith('LIBRARY/') ? href : `LIBRARY/${href}`,
    ]
    let xmlText: string | null = null
    for (const c of candidates) {
      xmlText = await readText(zip, c)
      if (xmlText) break
    }
    if (!xmlText) {
      warnings.push(`Missing symbol file: ${href}`)
      continue
    }
    const symbol = parseSymbolXml(xmlText, href)
    if (symbol) upsertSymbol(doc.library, symbol)
    else warnings.push(`Could not parse symbol: ${href}`)
  }

  // Also sweep LIBRARY folder for any XML not listed
  for (const key of Object.keys(zip.files)) {
    if (!/LIBRARY\/.+\.xml$/i.test(key) || zip.files[key]?.dir) continue
    const base = key.replace(/^.*LIBRARY\//i, '').replace(/\.xml$/i, '')
    const already = Object.values(doc.library.symbols).some(
      (s) => s.name === base || s.name.endsWith(`/${base}`) || key.endsWith(`${s.name}.xml`),
    )
    if (already) continue
    const xmlText = await readText(zip, key)
    if (!xmlText) continue
    const symbol = parseSymbolXml(xmlText, key)
    if (symbol && !doc.library.symbols[symbol.name]) {
      upsertSymbol(doc.library, symbol)
    }
  }

  const timelineEl = root.getElementsByTagName('DOMTimeline')[0]
  doc.timeline = parseTimeline(timelineEl, 'Scene 1')

  const symbolCount = Object.keys(doc.library.symbols).length
  if (!symbolCount) {
    warnings.push(
      'No library symbols found. Shape fidelity may be limited — try Save As Uncompressed XFL in Animate.',
    )
  }
  warnings.push(
    `Imported ${symbolCount} symbols, ${Object.keys(doc.library.bitmaps).length} bitmaps. Complex vector edges may approximate.`,
  )

  return { document: doc, warnings }
}

export async function importFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.caproj') || name.endsWith('.json')) {
    const text = await file.text()
    const document = JSON.parse(text) as Document
    return { document, warnings: [] }
  }
  if (
    name.endsWith('.fla') ||
    name.endsWith('.zip') ||
    name.endsWith('.xfl')
  ) {
    // .xfl marker file is tiny — user may drop a zip of the folder instead
    const buf = await file.arrayBuffer()
    // Detect zip magic
    const bytes = new Uint8Array(buf)
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b
    if (isZip) return importFlaOrXflZip(buf, file.name)
    if (name.endsWith('.xfl')) {
      throw new Error(
        'This looks like an XFL marker file. Zip the whole XFL folder (with DOMDocument.xml + LIBRARY) and import that, or use a .fla file.',
      )
    }
  }
  throw new Error(
    'Unsupported file. Use .fla, zipped .xfl folder, or .caproj.json',
  )
}
