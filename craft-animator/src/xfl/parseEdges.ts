import type { PathCommand } from '../core/types'

/** Parse Animate hex coord like #D0.3A or #FFFE (twips two's complement). */
export function parseXflNumber(token: string): number {
  const t = token.trim()
  if (!t) return 0
  if (t.startsWith('#')) {
    const body = t.slice(1)
    const [intPart, fracPart] = body.split('.')
    let n = Number.parseInt(intPart || '0', 16)
    if (!Number.isFinite(n)) return 0
    // 16-bit two's complement for large values
    if (n > 0x7fff) n -= 0x10000
    if (fracPart) {
      const frac = Number.parseInt(fracPart.padEnd(2, '0').slice(0, 2), 16)
      n += (Number.isFinite(frac) ? frac : 0) / 256
    }
    return n
  }
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : 0
}

/**
 * Tokenize edge / cubics strings. Ops glue to first number: !100 |200 [cx
 */
function tokenize(data: string): string[] {
  const out: string[] = []
  const re =
    /([!|/[\]S])(#?[0-9A-Fa-f.]+)?|(\([^;]*;)|(\);)|([qQ]#?[0-9A-Fa-f.\-]+)|(#?[+\-]?[0-9A-Fa-f.]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(data)) !== null) {
    if (m[1]) {
      out.push(m[1])
      if (m[2]) out.push(m[2])
    } else if (m[3]) {
      // (; or (anchor; — ignore marker, coords follow as numbers
      const inner = m[3].replace(/^\(|;$/g, '').trim()
      if (inner && !inner.includes(',')) {
        // bare — skip
      }
    } else if (m[4]) {
      // ); end cubic
    } else if (m[5]) {
      // q/Q approximations — skip whole token
    } else if (m[6]) {
      out.push(m[6])
    }
  }
  // Also split comma-separated cubic coords that regex may miss
  return out.flatMap((t) => t.split(',').filter(Boolean))
}

function readScaled(
  tokens: string[],
  i: { v: number },
  scale: number,
): number {
  const t = tokens[i.v++]
  if (t == null) return 0
  return parseXflNumber(t) * scale
}

/**
 * Parse Adobe XFL `edges` quadratic path data into path commands.
 */
export function parseEdgeData(data: string, twips = true): PathCommand[] {
  const cmds: PathCommand[] = []
  const scale = twips ? 1 / 20 : 1
  // Prefer a simpler splitter that keeps op glued numbers
  const raw = data.replace(/,/g, ' ').trim()
  const parts = raw.match(/[![\]|/S]|#?[+\-]?[0-9A-Fa-f.]+/g) || []
  const i = { v: 0 }
  let x = 0
  let y = 0

  while (i.v < parts.length) {
    const t = parts[i.v]
    if (!t) break
    const op = t[0]
    if (t.length === 1 && (op === '!' || op === '|' || op === '/' || op === '[' || op === ']' || op === 'S')) {
      i.v += 1
      if (op === 'S') {
        // style index may follow
        if (parts[i.v] && !/^[![\]|/S]$/.test(parts[i.v]!)) i.v += 1
        continue
      }
      if (op === '/') {
        // bare / with no coords = close
        const peek = parts[i.v]
        if (!peek || /^[![\]|/S]$/.test(peek)) {
          cmds.push({ type: 'close' })
          continue
        }
      }
      const a = readScaled(parts, i, scale)
      const b = readScaled(parts, i, scale)
      if (op === '!') {
        x = a
        y = b
        cmds.push({ type: 'move', x, y })
      } else if (op === '|' || op === '/') {
        x = a
        y = b
        cmds.push({ type: 'line', x, y })
      } else if (op === '[') {
        const cx = a
        const cy = b
        const ex = readScaled(parts, i, scale)
        const ey = readScaled(parts, i, scale)
        cmds.push({ type: 'quad', cx, cy, x: ex, y: ey })
        x = ex
        y = ey
      } else if (op === ']') {
        x = a
        y = b
        cmds.push({ type: 'line', x, y })
      }
    } else if (/^[![\]|/]/.test(t) && t.length > 1) {
      // glued op+number e.g. !100
      const gluedOp = t[0]!
      const first = parseXflNumber(t.slice(1)) * scale
      i.v += 1
      const second = readScaled(parts, i, scale)
      if (gluedOp === '!') {
        x = first
        y = second
        cmds.push({ type: 'move', x, y })
      } else if (gluedOp === '|' || gluedOp === '/') {
        x = first
        y = second
        cmds.push({ type: 'line', x, y })
      } else if (gluedOp === '[') {
        const cx = first
        const cy = second
        const ex = readScaled(parts, i, scale)
        const ey = readScaled(parts, i, scale)
        cmds.push({ type: 'quad', cx, cy, x: ex, y: ey })
        x = ex
        y = ey
      } else {
        x = first
        y = second
        cmds.push({ type: 'line', x, y })
      }
    } else {
      i.v += 1
    }
  }
  return cmds
}

/** Parse `cubics` attribute — approximate cubics as quads for canvas. */
export function parseCubicsData(data: string, twips = true): PathCommand[] {
  const cmds: PathCommand[] = []
  const scale = twips ? 1 / 20 : 1
  // Strip q/Q approximation junk
  const cleaned = data.replace(/[qQ][^()!]*/g, ' ')
  let lastX = 0
  let lastY = 0
  const blocks = cleaned.split(/(?=!)/)
  for (const block of blocks) {
    const mm = /!([#+\-\d.A-Fa-f]+)\s+([#+\-\d.A-Fa-f]+)/.exec(block)
    if (mm) {
      lastX = parseXflNumber(mm[1]!) * scale
      lastY = parseXflNumber(mm[2]!) * scale
      cmds.push({ type: 'move', x: lastX, y: lastY })
    }
    const cubicBody = block.match(/\([^;]*;([^)]*)\)/)
    if (cubicBody?.[1]) {
      const nums = cubicBody[1]
        .replace(/,/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => parseXflNumber(n) * scale)
      for (let i = 0; i + 5 < nums.length; i += 6) {
        const c1x = nums[i]!
        const c1y = nums[i + 1]!
        const c2x = nums[i + 2]!
        const c2y = nums[i + 3]!
        const ex = nums[i + 4]!
        const ey = nums[i + 5]!
        const mx = (c1x + c2x) / 2
        const my = (c1y + c2y) / 2
        cmds.push({ type: 'quad', cx: c1x, cy: c1y, x: mx, y: my })
        cmds.push({ type: 'quad', cx: c2x, cy: c2y, x: ex, y: ey })
        lastX = ex
        lastY = ey
      }
    }
  }
  return cmds
}

export function looksLikeTwips(edgeData: string): boolean {
  const nums = edgeData.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  if (!nums.length) return true
  const max = Math.max(...nums.map(Math.abs))
  return max > 400
}

void tokenize
