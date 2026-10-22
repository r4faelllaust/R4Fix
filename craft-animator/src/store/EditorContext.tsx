import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
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
  openRigPicker: () => Promise<void>
  saveProject: () => void
  totalFrames: number
  selectedLayerId: string | null
  setSelectedLayerId: (id: string | null) => void
  updateSelectedSymbolFirstFrame: (frame: number) => void
  nudgeSelection: (dx: number, dy: number) => void
  rotateSelection: (deg: number) => void
  frameRef: MutableRefObject<number>
  playingRef: MutableRefObject<boolean>
  drawGenRef: MutableRefObject<number>
  bumpDraw: () => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

// Cache Maple so "Demo Puppet" is instant
let mapleCache: Document | null = null
function getMaple(): Document {
  if (!mapleCache) mapleCache = createMaplePuppetDocument()
  return structuredClone(mapleCache)
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [doc, setDocState] = useState<Document>(() => getMaple())
  const [tool, setTool] = useState<ToolId>('select')
  const [selection, setSelection] = useState<EditorSelection>({
    layerId: null,
    elementIds: [],
    symbolEditPath: [],
  })
  const [playback, setPlaybackState] = useState<PlaybackState>({
    playing: false,
    currentFrame: 0,
    loop: true,
    onionSkin: false,
  })
  const [view, setView] = useState<ViewState>({ zoom: 0.85, panX: 80, panY: 40 })
  const [warnings, setWarnings] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(true)
  const [status, setStatus] = useState('Ready — press Play on the launcher')
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

  const frameRef = useRef(0)
  const playingRef = useRef(false)
  const drawGenRef = useRef(0)
  const loopRef = useRef(true)
  const totalRef = useRef(1)
  const fpsRef = useRef(24)
  const timerRef = useRef<number | null>(null)
  const uiSyncRef = useRef<number | null>(null)

  const bumpDraw = useCallback(() => {
    drawGenRef.current += 1
  }, [drawGenRef])

  const setDoc = useCallback(
    (next: Document | ((d: Document) => Document)) => {
      setDocState((d) => {
        const v = typeof next === 'function' ? next(d) : next
        drawGenRef.current += 1
        return v
      })
    },
    [],
  )

  const setPlayback = useCallback(
    (next: PlaybackState | ((p: PlaybackState) => PlaybackState)) => {
      setPlaybackState((p) => {
        const v = typeof next === 'function' ? next(p) : next
        frameRef.current = v.currentFrame
        playingRef.current = v.playing
        loopRef.current = v.loop
        drawGenRef.current += 1
        return v
      })
    },
    [],
  )

  const totalFrames = useMemo(() => timelineLength(doc.timeline), [doc])
  totalRef.current = totalFrames
  fpsRef.current = doc.frameRate || 24

  // Interval-driven playback — canvas reads frameRef; React UI syncs ~15fps
  useEffect(() => {
    if (!playback.playing) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (uiSyncRef.current) {
        window.clearInterval(uiSyncRef.current)
        uiSyncRef.current = null
      }
      return
    }

    const stepMs = 1000 / Math.max(1, fpsRef.current)
    timerRef.current = window.setInterval(() => {
      let next = frameRef.current + 1
      const total = totalRef.current
      if (next >= total) {
        if (loopRef.current) next = 0
        else {
          next = total - 1
          playingRef.current = false
          setPlaybackState((p) => ({ ...p, currentFrame: next, playing: false }))
          return
        }
      }
      frameRef.current = next
      drawGenRef.current += 1
    }, stepMs)

    uiSyncRef.current = window.setInterval(() => {
      setPlaybackState((p) => {
        if (p.currentFrame === frameRef.current && p.playing === playingRef.current)
          return p
        return {
          ...p,
          currentFrame: frameRef.current,
          playing: playingRef.current,
        }
      })
    }, 66)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (uiSyncRef.current) window.clearInterval(uiSyncRef.current)
      timerRef.current = null
      uiSyncRef.current = null
    }
  }, [playback.playing])

  useEffect(() => {
    const onToggle = () => {
      setPlayback((p) => ({ ...p, playing: !p.playing }))
    }
    window.addEventListener('craft-toggle-play', onToggle)
    return () => window.removeEventListener('craft-toggle-play', onToggle)
  }, [setPlayback])

  const newBlank = useCallback(() => {
    setDoc(createBlankDocument('Untitled'))
    setShowWelcome(false)
    setStatus('New blank document')
    setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
  }, [setDoc, setPlayback])

  const loadMaple = useCallback(() => {
    setDoc(getMaple())
    setShowWelcome(false)
    setStatus('Maple loaded')
    setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
    setWarnings([])
  }, [setDoc, setPlayback])

  const fitImported = useCallback(
    (width: number, height: number) => {
      // Fit stage into typical workspace (~1100x500 stage area)
      const zoom = Math.min(1.1, Math.max(0.35, Math.min(1050 / width, 480 / height)))
      setView({
        zoom,
        panX: Math.max(24, (1100 - width * zoom) / 2),
        panY: Math.max(16, (500 - height * zoom) / 2),
      })
    },
    [],
  )

  const importFromFile = useCallback(
    async (file: File) => {
      setStatus(`Importing ${file.name}…`)
      try {
        const { importFile } = await import('../xfl/importXfl')
        const result = await importFile(file)
        setDoc(result.document)
        setWarnings(result.warnings)
        setShowWelcome(false)
        fitImported(result.document.width, result.document.height)
        setStatus(`Rig loaded: ${file.name}`)
        setPlayback((p) => ({ ...p, currentFrame: 0, playing: false }))
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setWarnings([msg])
        setStatus(`Import failed: ${msg}`)
      }
    },
    [setDoc, setPlayback, fitImported],
  )

  const openRigPicker = useCallback(async () => {
    const api = window.craftAnimator
    if (api?.openRigDialog) {
      const picked = await api.openRigDialog()
      if (!picked) return
      const file = new File([picked.data], picked.name)
      await importFromFile(file)
      return
    }
    // Browser / always-works file picker
    await new Promise<void>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.fla,.xfl,.zip,.json,.caproj,.caproj.json'
      input.onchange = () => {
        const f = input.files?.[0]
        if (f) void importFromFile(f).finally(resolve)
        else resolve()
      }
      input.addEventListener('cancel', () => resolve())
      input.click()
    })
  }, [importFromFile])

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
    [selection, setDoc],
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
    [selection, setDoc],
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
    [selection, setDoc],
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
    openRigPicker,
    saveProject,
    totalFrames,
    selectedLayerId: selectedLayerId ?? doc.timeline.layers[0]?.id ?? null,
    setSelectedLayerId,
    updateSelectedSymbolFirstFrame,
    nudgeSelection,
    rotateSelection,
    frameRef,
    playingRef,
    drawGenRef,
    bumpDraw,
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
