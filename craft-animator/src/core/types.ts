/** Craft Animator document model — readable JSON (.caproj), Animate-inspired. */

export type Matrix2D = {
  a: number
  b: number
  c: number
  d: number
  tx: number
  ty: number
}

export type Point = { x: number; y: number }

export type ColorTransform = {
  alphaMultiplier?: number
  redMultiplier?: number
  greenMultiplier?: number
  blueMultiplier?: number
  alphaOffset?: number
  redOffset?: number
  greenOffset?: number
  blueOffset?: number
}

export type PathCommand =
  | { type: 'move'; x: number; y: number }
  | { type: 'line'; x: number; y: number }
  | { type: 'quad'; cx: number; cy: number; x: number; y: number }
  | { type: 'close' }

export type FillStyle = {
  color: string
  alpha?: number
}

export type StrokeStyle = {
  color: string
  weight: number
  alpha?: number
}

export type ShapePath = {
  fill?: FillStyle
  stroke?: StrokeStyle
  commands: PathCommand[]
}

export type ElementBase = {
  id: string
  name?: string
  matrix: Matrix2D
  pivot?: Point
  color?: ColorTransform
}

export type ShapeElement = ElementBase & {
  kind: 'shape'
  paths: ShapePath[]
}

export type SymbolInstanceElement = ElementBase & {
  kind: 'symbol'
  libraryItemName: string
  symbolType?: 'movieClip' | 'graphic' | 'button'
  firstFrame?: number
  loop?: 'loop' | 'play once' | 'single frame'
}

export type BitmapInstanceElement = ElementBase & {
  kind: 'bitmap'
  libraryItemName: string
  width: number
  height: number
}

export type TextElement = ElementBase & {
  kind: 'text'
  text: string
  fontSize: number
  color: string
  fontFamily?: string
}

export type StageElement =
  | ShapeElement
  | SymbolInstanceElement
  | BitmapInstanceElement
  | TextElement

export type Frame = {
  index: number
  duration: number
  keyframe: boolean
  tweenType?: 'none' | 'motion' | 'shape'
  label?: string
  elements: StageElement[]
}

export type Layer = {
  id: string
  name: string
  color: string
  visible: boolean
  locked: boolean
  layerType: 'normal' | 'guide' | 'folder' | 'mask' | 'masked' | 'camera'
  frames: Frame[]
}

export type Timeline = {
  name: string
  layers: Layer[]
}

export type SymbolItem = {
  name: string
  symbolType: 'movieClip' | 'graphic' | 'button'
  timeline: Timeline
  /** For mouth/eye swap rigs — which frame is “current” when scrubbing poses */
  linkage?: string
}

export type BitmapItem = {
  name: string
  href: string
  dataUrl?: string
  width: number
  height: number
}

export type Library = {
  symbols: Record<string, SymbolItem>
  bitmaps: Record<string, BitmapItem>
}

export type Document = {
  version: 1
  name: string
  width: number
  height: number
  frameRate: number
  backgroundColor: string
  timeline: Timeline
  library: Library
  /** Source hint when imported from Animate */
  sourceFormat?: 'caproj' | 'xfl' | 'fla'
  notes?: string
}

export type ToolId =
  | 'select'
  | 'freeTransform'
  | 'bone'
  | 'pencil'
  | 'brush'
  | 'ink'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'polyStar'
  | 'text'
  | 'hand'
  | 'zoom'
  | 'eyedropper'
  | 'paintBucket'

export type EditorSelection = {
  layerId: string | null
  elementIds: string[]
  symbolEditPath: string[]
}

export type PlaybackState = {
  playing: boolean
  currentFrame: number
  loop: boolean
  onionSkin: boolean
}
