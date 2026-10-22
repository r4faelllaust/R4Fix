import type { Matrix2D, Point } from './types'

export const identity = (): Matrix2D => ({
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  tx: 0,
  ty: 0,
})

export function multiply(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx,
    ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty,
  }
}

export function transformPoint(m: Matrix2D, p: Point): Point {
  return {
    x: m.a * p.x + m.c * p.y + m.tx,
    y: m.b * p.x + m.d * p.y + m.ty,
  }
}

export function translate(tx: number, ty: number): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, tx, ty }
}

export function rotate(deg: number): Matrix2D {
  const r = (deg * Math.PI) / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  return { a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0 }
}

export function scale(sx: number, sy: number): Matrix2D {
  return { a: sx, b: 0, c: 0, d: sy, tx: 0, ty: 0 }
}

export function decompose(m: Matrix2D): {
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  skewX: number
} {
  const scaleX = Math.hypot(m.a, m.b) || 1e-8
  const scaleY = Math.hypot(m.c, m.d) || 1e-8
  const rotation = (Math.atan2(m.b, m.a) * 180) / Math.PI
  const skewX =
    (Math.atan2(-m.c, m.d) * 180) / Math.PI - rotation
  return {
    x: m.tx,
    y: m.ty,
    rotation,
    scaleX: m.a * m.d - m.b * m.c < 0 ? -scaleX : scaleX,
    scaleY,
    skewX,
  }
}

export function compose(opts: {
  x?: number
  y?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}): Matrix2D {
  const sx = opts.scaleX ?? 1
  const sy = opts.scaleY ?? 1
  const r = ((opts.rotation ?? 0) * Math.PI) / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  return {
    a: cos * sx,
    b: sin * sx,
    c: -sin * sy,
    d: cos * sy,
    tx: opts.x ?? 0,
    ty: opts.y ?? 0,
  }
}

export function applyToCanvas(
  ctx: CanvasRenderingContext2D,
  m: Matrix2D,
): void {
  ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty)
}
