import type { Document } from '../core/types'

/** Detect pose-swap symbols for the Rig panel */
export function findPoseSymbols(doc: Document): {
  name: string
  frames: number
  kind: 'eyes' | 'mouth' | 'hand' | 'other'
}[] {
  return Object.values(doc.library.symbols)
    .map((s) => {
      const frames = Math.max(
        1,
        ...s.timeline.layers.map((l) =>
          l.frames.reduce((m, f) => Math.max(m, f.index + f.duration), 0),
        ),
      )
      const n = s.name.toLowerCase()
      let kind: 'eyes' | 'mouth' | 'hand' | 'other' = 'other'
      if (/eye|blink|pupils?/.test(n)) kind = 'eyes'
      else if (/mouth|lips?|jaw|talk/.test(n)) kind = 'mouth'
      else if (/hand|fist|palm|finger/.test(n)) kind = 'hand'
      return { name: s.name, frames, kind }
    })
    .filter((s) => s.frames > 1 || s.kind !== 'other')
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))
}
