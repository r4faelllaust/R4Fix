import {
  createBlankDocument,
  ellipsePath,
  makeFrame,
  makeLayer,
  makeTimeline,
  rectPath,
  shapeFromPaths,
  upsertSymbol,
} from '../core/document'
import { compose, identity } from '../core/matrix'
import { uid } from '../core/id'
import type { Document } from '../core/types'

/** Extra starter scene — bouncing logo — more “real app” sample content. */
export function createBounceLogoDocument(): Document {
  const doc = createBlankDocument('Bounce Logo', 1280, 720)
  doc.backgroundColor = '#1e2430'
  doc.notes = 'Starter motion scene — scrub or press Play.'

  upsertSymbol(doc.library, {
    name: 'LogoMark',
    symbolType: 'graphic',
    timeline: makeTimeline('LogoMark', [
      makeLayer('Art', '#f0a05a', [
        makeFrame(0, [
          shapeFromPaths(
            [
              rectPath(-80, -28, 160, 56, '#2d6ca8', '#0b1e33', 3, 10),
              ellipsePath(-40, 0, 14, 14, '#f0a05a'),
              ellipsePath(40, 0, 14, 14, '#f0a05a'),
            ],
            identity(),
            'logo',
          ),
        ]),
      ]),
    ]),
  })

  const a = {
    kind: 'symbol' as const,
    id: uid('el'),
    libraryItemName: 'LogoMark',
    symbolType: 'graphic' as const,
    loop: 'single frame' as const,
    matrix: compose({ x: 640, y: 280 }),
  }
  const b = {
    ...a,
    id: uid('el'),
    matrix: compose({ x: 640, y: 420, rotation: 8 }),
  }
  const c = {
    ...a,
    id: uid('el'),
    matrix: compose({ x: 640, y: 300, rotation: -4 }),
  }

  const f0 = makeFrame(0, [a], 12)
  f0.tweenType = 'motion'
  const f12 = makeFrame(12, [b], 12)
  f12.tweenType = 'motion'
  const f24 = makeFrame(24, [c], 12)

  doc.timeline = makeTimeline('Scene 1', [
    makeLayer('Logo', '#4fa3ff', [f0, f12, f24]),
    makeLayer('Floor', '#666', [
      makeFrame(
        0,
        [
          shapeFromPaths(
            [rectPath(200, 520, 880, 16, '#2a3344', '#111', 2, 4)],
            identity(),
          ),
        ],
        36,
      ),
    ]),
  ])

  return doc
}
