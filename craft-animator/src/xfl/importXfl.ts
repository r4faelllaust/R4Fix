import JSZip from 'jszip'
import {
  createBlankDocument,
  makeFrame,
  makeLayer,
  makeTimeline,
  upsertSymbol,
} from '../core/document'
import { compose, identity } from '../core/matrix'
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
import {
  looksLikeTwips,
  parseCubicsData,
  parseEdgeData,
} from './parseEdges'

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
  const matrixEl = parent?.getElementsByTagName('Matrix')[0]
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

function normalizeLibName(name: string): string {
  return name.replace(/\\/g, '/').replace(/^\.\//, '')
}

function parseShapeElement(shapeEl: Element): StageElement | null {
  const paths: ShapePath[] = []
  const fillsNode = shapeEl.getElementsByTagName('fills')[0]
  const strokesNode = shapeEl.getElementsByTagName('strokes')[0]
  const edgesNode = shapeEl.getElementsByTagName('edges')[0]

  const fillEls = fillsNode
    ? Array.from(fillsNode.getElementsByTagName('FillStyle'))
    : Array.from(shapeEl.getElementsByTagName('FillStyle'))
  const strokeEls = strokesNode
    ? Array.from(strokesNode.getElementsByTagName('StrokeStyle'))
    : Array.from(shapeEl.getElementsByTagName('StrokeStyle'))
  const edgeEls = edgesNode
    ? Array.from(edgesNode.getElementsByTagName('Edge'))
    : Array.from(shapeEl.getElementsByTagName('Edge'))

  const fillMap = new Map<number, { color: string; alpha: number }>()
  for (const f of fillEls) {
    const idx = numAttr(f, 'index', 1)
    const solid = f.getElementsByTagName('SolidColor')[0]
    const grad = f.getElementsByTagName('LinearGradient')[0] || f.getElementsByTagName('RadialGradient')[0]
    if (solid) {
      fillMap.set(idx, {
        color: fillColorFromSolid(solid),
        alpha: numAttr(solid, 'alpha', 1),
      })
    } else if (grad) {
      const entry = grad.getElementsByTagName('GradientEntry')[0]
      fillMap.set(idx, {
        color: attr(entry, 'color', '#888888'),
        alpha: numAttr(entry, 'alpha', 1),
      })
    } else {
      // BitmapFill — solid placeholder; bitmap drawn separately when possible
      const bmp = f.getElementsByTagName('BitmapFill')[0]
      fillMap.set(idx, {
        color: bmp ? '#cccccc' : '#888888',
        alpha: 1,
      })
    }
  }

  const strokeMap = new Map<
    number,
    { color: string; weight: number; alpha: number }
  >()
  for (const s of strokeEls) {
    const idx = numAttr(s, 'index', 1)
    const solidStroke = s.getElementsByTagName('SolidStroke')[0]
    const solid =
      solidStroke?.getElementsByTagName('SolidColor')[0] ||
      s.getElementsByTagName('SolidColor')[0]
    strokeMap.set(idx, {
      color: fillColorFromSolid(solid),
      weight: Math.max(0.5, numAttr(solidStroke, 'weight', 1)),
      alpha: numAttr(solid, 'alpha', 1),
    })
  }

  for (const edge of edgeEls) {
    const cubicsAttr = attr(edge, 'cubics')
    const edgesAttr = attr(edge, 'edges')
    const source = cubicsAttr || edgesAttr
    if (!source) continue
    const twips = looksLikeTwips(source)
    const commands = cubicsAttr
      ? parseCubicsData(cubicsAttr, twips)
      : parseEdgeData(edgesAttr, twips)
    if (!commands.length) continue

    // fillStyle1 = left/forward (primary), fillStyle0 = right
    const fillIdx =
      numAttr(edge, 'fillStyle1', 0) || numAttr(edge, 'fillStyle0', 0)
    const strokeIdx = numAttr(edge, 'strokeStyle', 0)
    const fill = fillIdx ? fillMap.get(fillIdx) : undefined
    const stroke = strokeIdx ? strokeMap.get(strokeIdx) : undefined

    // Auto-close filled subpaths
    const closed = [...commands]
    if (fill && closed.length && closed[closed.length - 1]?.type !== 'close') {
      closed.push({ type: 'close' })
    }

    paths.push({
      fill: fill ? { color: fill.color, alpha: fill.alpha } : undefined,
      stroke: stroke
        ? { color: stroke.color, weight: stroke.weight, alpha: stroke.alpha }
        : undefined,
      commands: closed,
    })
  }

  if (!paths.length && fillMap.size) {
    const first = [...fillMap.values()][0]!
    paths.push({
      fill: { color: first.color, alpha: first.alpha },
      commands: [
        { type: 'move', x: -24, y: -24 },
        { type: 'line', x: 24, y: -24 },
        { type: 'line', x: 24, y: 24 },
        { type: 'line', x: -24, y: 24 },
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

  const walk = (node: Element) => {
    const tag = node.tagName
    if (tag === 'DOMSymbolInstance') {
      const typeAttr = attr(node, 'symbolType', '')
      const symbolType =
        typeAttr === 'graphic'
          ? 'graphic'
          : typeAttr === 'button'
            ? 'button'
            : 'movieClip'
      const loopRaw = attr(node, 'loop', 'loop')
      out.push({
        kind: 'symbol',
        id: uid('el'),
        name: attr(node, 'name') || undefined,
        libraryItemName: normalizeLibName(attr(node, 'libraryItemName')),
        symbolType,
        firstFrame: numAttr(node, 'firstFrame', 0),
        loop:
          loopRaw === 'play once' || loopRaw === 'single frame'
            ? loopRaw
            : 'loop',
        matrix: parseMatrix(node),
        color: parseColor(node),
      })
    } else if (tag === 'DOMBitmapInstance') {
      const name = normalizeLibName(attr(node, 'libraryItemName'))
      out.push({
        kind: 'bitmap',
        id: uid('el'),
        libraryItemName: name,
        matrix: parseMatrix(node),
        color: parseColor(node),
        width: numAttr(node, 'frameRight', 0) / 20 || 100,
        height: numAttr(node, 'frameBottom', 0) / 20 || 100,
      })
    } else if (tag === 'DOMShape') {
      const shape = parseShapeElement(node)
      if (shape) out.push(shape)
    } else if (tag === 'DOMRectangleObject') {
      const x = numAttr(node, 'x', 0)
      const y = numAttr(node, 'y', 0)
      const w = numAttr(node, 'objectWidth', 40)
      const h = numAttr(node, 'objectHeight', 40)
      const fill = node.querySelector('SolidColor')
      out.push({
        kind: 'shape',
        id: uid('el'),
        matrix: parseMatrix(node),
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
      const x = numAttr(node, 'x', 0)
      const y = numAttr(node, 'y', 0)
      const w = numAttr(node, 'objectWidth', 40)
      const h = numAttr(node, 'objectHeight', 40)
      const fill = node.querySelector('SolidColor')
      const cx = x + w / 2
      const cy = y + h / 2
      const rx = w / 2
      const ry = h / 2
      const k = 0.5522847498
      out.push({
        kind: 'shape',
        id: uid('el'),
        matrix: parseMatrix(node),
        paths: [
          {
            fill: { color: fillColorFromSolid(fill) },
            commands: [
              { type: 'move', x: cx + rx, y: cy },
              { type: 'quad', cx: cx + rx, cy: cy - ry * k, x: cx, y: cy - ry },
              { type: 'quad', cx: cx - rx * k, cy: cy - ry, x: cx - rx, y: cy },
              { type: 'quad', cx: cx - rx, cy: cy + ry * k, x: cx, y: cy + ry },
              { type: 'quad', cx: cx + rx * k, cy: cy + ry, x: cx + rx, y: cy },
              { type: 'close' },
            ],
          },
        ],
      })
    } else if (tag === 'DOMStaticText' || tag === 'DOMDynamicText' || tag === 'DOMInputText') {
      const textRuns = Array.from(node.getElementsByTagName('DOMTextRun'))
      const text =
        textRuns
          .map((r) => r.getElementsByTagName('characters')[0]?.textContent ?? '')
          .join('') ||
        node.textContent?.trim() ||
        'Text'
      const attrs = node.getElementsByTagName('DOMTextAttrs')[0]
      out.push({
        kind: 'text',
        id: uid('el'),
        matrix: parseMatrix(node),
        text,
        fontSize: numAttr(attrs, 'size', 14),
        color: attr(attrs, 'fillColor', '#000000'),
        fontFamily: attr(attrs, 'face', 'Arial'),
      })
    } else if (tag === 'DOMGroup') {
      const members =
        node.getElementsByTagName('members')[0] ||
        node.getElementsByTagName('elements')[0]
      if (members) {
        for (const child of Array.from(members.children)) {
          if (child instanceof Element) walk(child)
        }
      }
    } else if (tag === 'elements' || tag === 'members' || tag === 'DOMLayer') {
      for (const child of Array.from(node.children)) {
        if (child instanceof Element) walk(child)
      }
    }
  }

  for (const child of Array.from(container.children)) {
    if (child instanceof Element) walk(child)
  }
  // If container itself is elements/members
  if (!out.length && (container.tagName === 'elements' || container.tagName === 'members')) {
    for (const child of Array.from(container.children)) {
      if (child instanceof Element) walk(child)
    }
  }
  return out
}

function parseFrames(layerEl: Element): Frame[] {
  const framesNode = layerEl.getElementsByTagName('frames')[0]
  const frameEls = framesNode
    ? Array.from(framesNode.children).filter((c) => c.tagName === 'DOMFrame')
    : Array.from(layerEl.getElementsByTagName('DOMFrame')).filter(
        (f) => f.parentElement === framesNode || f.parentElement?.tagName === 'frames',
      )

  const frames: Frame[] = []
  for (const f of frameEls) {
    const elementsEl =
      Array.from(f.children).find((c) => c.tagName === 'elements') ||
      f.getElementsByTagName('elements')[0]
    frames.push({
      index: numAttr(f, 'index', 0),
      duration: numAttr(f, 'duration', 1),
      keyframe: true,
      tweenType: (attr(f, 'tweenType', 'none') as Frame['tweenType']) || 'none',
      label: attr(f, 'name') || undefined,
      elements: parseElements(elementsEl ?? null),
    })
  }
  const byIndex = new Map<number, Frame>()
  for (const fr of frames) {
    if (!byIndex.has(fr.index)) byIndex.set(fr.index, fr)
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index)
}

function parseTimeline(timelineEl: Element | null, fallbackName: string): Timeline {
  if (!timelineEl) return makeTimeline(fallbackName)
  const name = attr(timelineEl, 'name', fallbackName)
  const layersNode = timelineEl.getElementsByTagName('layers')[0]
  const topLayers = layersNode
    ? Array.from(layersNode.children).filter((c) => c.tagName === 'DOMLayer')
    : []

  const layers: Layer[] = topLayers.map((layerEl, i) => {
    const frames = parseFrames(layerEl)
    return {
      id: uid('layer'),
      name: attr(layerEl, 'name', `Layer_${i + 1}`),
      color: attr(layerEl, 'color', '#4fa3ff'),
      visible: boolAttr(layerEl, 'visible', true),
      locked: boolAttr(layerEl, 'locked', false),
      layerType:
        (attr(layerEl, 'layerType', 'normal') as Layer['layerType']) || 'normal',
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
  const hrefName = normalizeLibName(
    hrefHint.replace(/^.*LIBRARY\//i, '').replace(/\.xml$/i, ''),
  )
  const name = normalizeLibName(attr(root, 'name') || hrefName)
  const typeAttr = attr(root, 'symbolType', 'movie clip').toLowerCase()
  const symbolType = typeAttr.includes('graphic')
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

async function readText(zip: JSZip, path: string): Promise<string | null> {
  const norm = path.replace(/\\/g, '/')
  let file = zip.file(norm) ?? zip.file(norm.replace(/^\//, ''))
  if (!file) {
    const lower = norm.toLowerCase()
    const match = Object.keys(zip.files).find((k) => k.toLowerCase() === lower)
    if (!match) return null
    file = zip.file(match)
  }
  if (!file || file.dir) return null
  return file.async('string')
}

function findDomDocumentPath(zip: JSZip): string | null {
  return Object.keys(zip.files).find((k) => /(^|\/)DOMDocument\.xml$/i.test(k)) ?? null
}

async function loadBitmaps(
  zip: JSZip,
  dom: Document,
  mediaNodes: Element[],
): Promise<void> {
  for (const media of mediaNodes) {
    if (media.tagName !== 'DOMBitmapItem') continue
    const name = normalizeLibName(attr(media, 'name'))
    const href = attr(media, 'href') || attr(media, 'bitmapDataHRef')
    if (!name) continue
    let dataUrl: string | undefined
    let width = numAttr(media, 'frameRight', 0) / 20 || 100
    let height = numAttr(media, 'frameBottom', 0) / 20 || 100

    const candidates = href
      ? [
          href,
          `LIBRARY/${href}`,
          `LIBRARY/${href.split('/').pop()}`,
          `bin/${href}`,
          href.replace(/^LIBRARY\//, ''),
        ]
      : []

    // Also search by basename anywhere in zip
    const base = (href || name).split('/').pop()!
    for (const key of Object.keys(zip.files)) {
      if (key.toLowerCase().endsWith('/' + base.toLowerCase()) || key.toLowerCase().endsWith(base.toLowerCase())) {
        candidates.push(key)
      }
    }

    for (const c of candidates) {
      const file =
        zip.file(c) ||
        Object.keys(zip.files)
          .filter((k) => k.toLowerCase() === c.toLowerCase())
          .map((k) => zip.file(k))[0]
      if (file && !file.dir) {
        const buf = await file.async('base64')
        const ext = c.split('.').pop()?.toLowerCase()
        const mime =
          ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'gif'
              ? 'image/gif'
              : ext === 'webp'
                ? 'image/webp'
                : 'image/png'
        dataUrl = `data:${mime};base64,${buf}`
        break
      }
    }

    const item: BitmapItem = { name, href: href || name, dataUrl, width, height }
    dom.library.bitmaps[name] = item
    // alias basename
    const short = name.split('/').pop()!
    if (short !== name) dom.library.bitmaps[short] = item
  }
}

/** If stage is empty but library has a root character, place it centered. */
function ensureStageHasContent(doc: Document, warnings: string[]): void {
  const hasContent = doc.timeline.layers.some((l) =>
    l.frames.some((f) => f.elements.length > 0),
  )
  if (hasContent) return

  const symbols = Object.values(doc.library.symbols)
  const scored = symbols.map((s) => {
    const n = s.name.toLowerCase()
    let score = s.symbolType === 'movieClip' ? 2 : 0
    if (/(char|puppet|body|rig|eric|cartman|kid|figure|hero)/i.test(n)) score += 5
    if (/(eye|mouth|hand|leg|arm|hat|shoe)/i.test(n)) score -= 3
    const depth = s.name.split('/').length
    score += Math.max(0, 3 - depth)
    return { s, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const pick = scored[0]?.s
  if (!pick) return

  const inst = {
    kind: 'symbol' as const,
    id: uid('el'),
    libraryItemName: pick.name,
    symbolType: pick.symbolType,
    firstFrame: 0,
    loop: 'loop' as const,
    matrix: compose({ x: doc.width / 2, y: doc.height / 2 }),
  }
  doc.timeline = makeTimeline('Scene 1', [
    makeLayer('Rig', '#f0a05a', [makeFrame(0, [inst], 48)]),
  ])
  warnings.push(`Stage was empty — placed library symbol "${pick.name}" centered.`)
}

export type ImportResult = {
  document: Document
  warnings: string[]
}

function aliasSymbols(doc: Document): void {
  const extras: Record<string, SymbolItem> = {}
  for (const [key, sym] of Object.entries(doc.library.symbols)) {
    const base = key.split('/').pop()!
    if (base && !doc.library.symbols[base] && !extras[base]) {
      extras[base] = sym
    }
    // Windows path style
    const win = key.replace(/\//g, '\\')
    if (!doc.library.symbols[win]) extras[win] = sym
  }
  Object.assign(doc.library.symbols, extras)
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
      'No DOMDocument.xml found. Use a .fla from Adobe Animate, or zip the whole XFL folder (DOMDocument.xml + LIBRARY).',
    )
  }

  const domXml = await readText(zip, domPath)
  if (!domXml) throw new Error('Could not read DOMDocument.xml')

  const xml = new DOMParser().parseFromString(domXml, 'application/xml')
  const root = xml.getElementsByTagName('DOMDocument')[0]
  if (!root) throw new Error('Invalid DOMDocument.xml')

  const doc = createBlankDocument(
    fileName.replace(/\.(fla|xfl|zip)$/i, '') || 'Imported Rig',
    numAttr(root, 'width', 550),
    numAttr(root, 'height', 400),
  )
  doc.frameRate = numAttr(root, 'frameRate', 24)
  doc.backgroundColor = attr(root, 'backgroundColor', '#ffffff')
  doc.sourceFormat = fileName.toLowerCase().endsWith('.fla') ? 'fla' : 'xfl'

  const mediaParent = root.getElementsByTagName('media')[0]
  if (mediaParent) {
    await loadBitmaps(zip, doc, Array.from(mediaParent.children))
  }

  const includes = Array.from(root.getElementsByTagName('Include'))
  const libraryFolder = domPath.includes('/')
    ? domPath.replace(/DOMDocument\.xml$/i, 'LIBRARY/')
    : 'LIBRARY/'

  for (const inc of includes) {
    const href = normalizeLibName(attr(inc, 'href'))
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
      warnings.push(`Missing symbol: ${href}`)
      continue
    }
    const symbol = parseSymbolXml(xmlText, href)
    if (symbol) upsertSymbol(doc.library, symbol)
    else warnings.push(`Could not parse: ${href}`)
  }

  for (const key of Object.keys(zip.files)) {
    if (!/LIBRARY\/.+\.xml$/i.test(key) || zip.files[key]?.dir) continue
    const xmlText = await readText(zip, key)
    if (!xmlText) continue
    const symbol = parseSymbolXml(xmlText, key)
    if (symbol && !doc.library.symbols[symbol.name]) {
      upsertSymbol(doc.library, symbol)
    }
  }

  const timelineEl = root.getElementsByTagName('DOMTimeline')[0]
  doc.timeline = parseTimeline(timelineEl, 'Scene 1')

  aliasSymbols(doc)
  ensureStageHasContent(doc, warnings)

  const symbolCount = Object.keys(doc.library.symbols).length
  const poseSymbols = Object.values(doc.library.symbols).filter((s) =>
    s.timeline.layers.some((l) => l.frames.length > 1),
  )
  warnings.push(
    `Imported ${symbolCount} symbols · ${Object.keys(doc.library.bitmaps).length} bitmaps · ${poseSymbols.length} multi-frame pose symbols (eyes/mouth/etc).`,
  )
  if (!symbolCount) {
    warnings.push(
      'No library symbols — try File → Save As → Flash CS5 Uncompressed (.xfl) in Animate, then zip that folder.',
    )
  }

  return { document: doc, warnings }
}

export async function importFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.caproj') || name.endsWith('.json') || name.endsWith('.caproj.json')) {
    const text = await file.text()
    const document = JSON.parse(text) as Document
    return { document, warnings: ['Opened Craft Animator project'] }
  }
  if (name.endsWith('.fla') || name.endsWith('.zip') || name.endsWith('.xfl')) {
    const buf = await file.arrayBuffer()
    const bytes = new Uint8Array(buf)
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b
    if (isZip) return importFlaOrXflZip(buf, file.name)
    if (name.endsWith('.xfl')) {
      throw new Error(
        'That .xfl file is only a marker. Zip the whole XFL folder (DOMDocument.xml + LIBRARY) or use the .fla download.',
      )
    }
  }
  throw new Error('Use a .fla (recommended for Eric-style rigs), a zipped XFL folder, or .caproj.json')
}

export { findPoseSymbols } from './poseSymbols'
