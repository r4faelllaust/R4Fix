import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  cloneDocument,
  createBlankDocument,
  downloadJson,
  timelineLength,
} from '../core/document'
import type {
  Document,
  EditorSelection,
  PlaybackState,
  ToolId,
} from '../core/types'
import { createMaplePuppetDocument } from '../rigs/maplePuppet'
import { importFile } from '../xfl/importXfl'

type ViewState = { zoom: number; panX: number; panY: number }

type EditorContextValue = {
  doc: Document
  setDoc: (doc: Document | ((d: Document) => Document)) => void
  tool: ToolId
  setTool: (t: ToolId) => void
  selection: EditorSelection
  setSelection: (s: EditorSelection) => void
  playback: PlaybackState
  setPlayback: (p: PlaybackState | ((p: PlaybackState) => PlaybackState)) => void
  view: ViewState
  setView: (v: ViewState | ((v: ViewState) => ViewState)) => void
  warnings: string[]
  setWarnings: (w: string[]) => void
  showWelcome: boolean
  setShowWelcome: (v: boolean) => void
  status: string
  setStatus: (s: string) => void
  newBlank: () => void
  loadMaple: () => void
  importFromFile: (file: File) => Promise<void>
  saveProject: () => void
  totalFrames: number
  selectedLayerId: string | null
  setSelectedLayerId: (id: string | null) => void
  updateSelectedSymbolFirstFrame: (frame: number) => void
  nudgeSelection: (dx: number, dy: number) => void
  rotateSelection: (deg: number) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<Document>(() => createMaplePuppetDocument())
  const [tool, setTool] = useState<ToolId>('select')
  const [selection, setSelection] = useState<EditorSelection>({
    layerId: null,
    elementIds: [],
    symbolEditPath: [],
  })
  const [playback, setPlayback] = useState<PlaybackState>({
    playing: false,
    currentFrame: 0,
    loop: true,
    onionSkin: false,
  })
  const [view, setView] = useState<ViewState>({ zoom: 0.85, panX: 80, panY: 40 })
  const [warnings, setWarnings] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(true)
  const [status, setStatus] = useState('Maple demo puppet loaded')
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const raf = useRef<number | null>(null)
  const lastTick = useRef(0)

  const totalFrames = useMemo(() => timelineLength(doc.timeline), [doc])

  useEffect(() => {
    if (!playback.playing) {
      if (raf.current) cancelAnimationFrame(raf.current)
      return
    }
    const fps = doc.frameRate || 24
    const step = 1000 / fps
    const loop = (t: number) => {
      if (t - lastTick.current >= step) {
        lastTick.current = t
        setPlayback((p) => {
          let next = p.currentFrame + 1
          if (next >= totalFrames) next = p.loop ? 0 : totalFrames - 1
          return {
            ...p,
            currentFrame: next,
            playing: p.loop || next < totalFrames - 1,
          }
        })
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [playback.playing, doc.frameRate, totalFrames])

  const newBlank = useCallback(() => {
    setDoc(createBlankDocument('Untitled'))
    setShowWelcome(false)
    setStatus('New blank document')
    setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
  }, [])

  const loadMaple = useCallback(() => {
    setDoc(createMaplePuppetDocument())
    setShowWelcome(false)
    setStatus('Loaded Maple puppet demo')
    setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
    setWarnings([])
  }, [])

  const importFromFile = useCallback(async (file: File) => {
    setStatus(`Importing ${file.name}…`)
    try {
      const result = await importFile(file)
      setDoc(result.document)
      setWarnings(result.warnings)
      setShowWelcome(false)
      setStatus(`Imported ${file.name}`)
      setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setWarnings([msg])
      setStatus(`Import failed: ${msg}`)
    }
  }, [])

  const saveProject = useCallback(() => {
    downloadJson(doc)
    setStatus('Saved .caproj.json')
  }, [doc])

  const updateSelectedSymbolFirstFrame = useCallback(
    (frame: number) => {
      if (!selection.layerId || !selection.elementIds.length) return
      setDoc((d) => {
        const next = cloneDocument(d)
        const layer = next.timeline.layers.find((l) => l.id === selection.layerId)
        if (!layer) return d
        for (const fr of layer.frames) {
          for (const el of fr.elements) {
            if (selection.elementIds.includes(el.id) && el.kind === 'symbol') {
              el.firstFrame = Math.max(0, frame)
              el.loop = 'single frame'
            }
          }
        }
        return next
      })
      setStatus(`Face/pose frame → ${frame}`)
    },
    [selection],
  )

  const nudgeSelection = useCallback(
    (dx: number, dy: number) => {
      if (!selection.layerId || !selection.elementIds.length) return
      setDoc((d) => {
        const next = cloneDocument(d)
        const layer = next.timeline.layers.find((l) => l.id === selection.layerId)
        if (!layer) return d
        for (const fr of layer.frames) {
          for (const el of fr.elements) {
            if (selection.elementIds.includes(el.id)) {
              el.matrix.tx += dx
              el.matrix.ty += dy
            }
          }
        }
        return next
      })
    },
    [selection],
  )

  const rotateSelection = useCallback(
    (deg: number) => {
      if (!selection.layerId || !selection.elementIds.length) return
      setDoc((d) => {
        const next = cloneDocument(d)
        const layer = next.timeline.layers.find((l) => l.id === selection.layerId)
        if (!layer) return d
        for (const fr of layer.frames) {
          for (const el of fr.elements) {
            if (selection.elementIds.includes(el.id)) {
              const m = el.matrix
              const r = (deg * Math.PI) / 180
              const cos = Math.cos(r)
              const sin = Math.sin(r)
              el.matrix = {
                ...m,
                a: m.a * cos + m.c * sin,
                b: m.b * cos + m.d * sin,
                c: m.c * cos - m.a * sin,
                d: m.d * cos - m.b * sin,
              }
            }
          }
        }
        return next
      })
    },
    [selection],
  )

  const value: EditorContextValue = {
    doc,
    setDoc,
    tool,
    setTool,
    selection,
    setSelection,
    playback,
    setPlayback,
    view,
    setView,
    warnings,
    setWarnings,
    showWelcome,
    setShowWelcome,
    status,
    setStatus,
    newBlank,
    loadMaple,
    importFromFile,
    saveProject,
    totalFrames,
    selectedLayerId: selectedLayerId ?? doc.timeline.layers[0]?.id ?? null,
    setSelectedLayerId,
    updateSelectedSymbolFirstFrame,
    nudgeSelection,
    rotateSelection,
  }

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor outside provider')
  return ctx
}
