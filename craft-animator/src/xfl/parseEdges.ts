import type { PathCommand } from '../core/types'

/**
 * Parse Adobe XFL edge data strings into path commands.
 * Tokens: !x y (move), |x y (line), /x y (line), [cx cy x y (quad)
 * Coordinates are often in twips (1/20 px) when integers — we detect heuristically.
 */
export function parseEdgeData(data: string, twips = true): PathCommand[] {
  const cmds: PathCommand[] = []
  const scale = twips ? 1 / 20 : 1
  const tokens = data.trim().split(/[\s]+/).filter(Boolean)
  let i = 0
  let x = 0
  let y = 0

  const readNum = (): number => {
    const t = tokens[i++]
    if (t == null) return 0
    // Handle "#hex" style — rare; skip
    if (t.startsWith('#')) return 0
    return Number.parseFloat(t) * scale
  }

  while (i < tokens.length) {
    const t = tokens[i]
    if (!t) break
    const op = t[0]
    const rest = t.slice(1)

    if (op === '!' || op === '|' || op === '/' || op === '[' || op === ']') {
      i += 1
      const first = rest.length ? Number.parseFloat(rest) * scale : readNum()
      const second = readNum()
      if (op === '!') {
        x = first
        y = second
        cmds.push({ type: 'move', x, y })
      } else if (op === '|' || op === '/') {
        x = first
        y = second
        cmds.push({ type: 'line', x, y })
      } else if (op === '[') {
        const cx = first
        const cy = second
        const ex = readNum()
        const ey = readNum()
        cmds.push({ type: 'quad', cx, cy, x: ex, y: ey })
        x = ex
        y = ey
      } else if (op === ']') {
        // cubic-ish — treat as line to end for MVP
        x = first
        y = second
        cmds.push({ type: 'line', x, y })
      }
    } else if (t === 'S' || t.startsWith('S')) {
      // stroke hint / selection — skip token
      i += 1
    } else {
      // bare numbers — ignore orphan
      i += 1
    }
  }
  return cmds
}

export function looksLikeTwips(edgeData: string): boolean {
  const nums = edgeData.match(/-?\d+/g)?.map(Number) ?? []
  if (!nums.length) return true
  const max = Math.max(...nums.map(Math.abs))
  return max > 400
}
