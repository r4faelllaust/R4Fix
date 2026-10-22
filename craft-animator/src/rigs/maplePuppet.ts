/**
 * Maple — original demo puppet for Craft Animator.
 * Nested-symbol workflow matching DeviantArt Adobe Animate community rigs
 * (eye/mouth frame swaps, limb movie clips) without copying any third-party IP.
 */
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
import type { Document, ShapePath, SymbolItem, Timeline } from '../core/types'

const INK = '#2a241c'
const SKIN = '#f3c39a'
const BEANIE = '#3d6b4f'
const BEANIE_POM = '#e8b84a'
const JACKET = '#c45c3a'
const JACKET_TRIM = '#8f3a24'
const PANTS = '#4a5d78'
const SHOE = '#2f2a26'

function symbolTimeline(name: string, paths: ShapePath[]): SymbolItem {
  const el = shapeFromPaths(paths, identity(), name)
  return {
    name,
    symbolType: 'graphic',
    timeline: makeTimeline(name, [
      makeLayer('Art', '#ff8a4c', [makeFrame(0, [el])]),
    ]),
  }
}

function multiFrameSymbol(
  name: string,
  frames: { label: string; paths: ShapePath[] }[],
): SymbolItem {
  const layerFrames = frames.map((f, i) => {
    const el = shapeFromPaths(f.paths, identity(), f.label)
    return makeFrame(i, [el], 1)
  })
  return {
    name,
    symbolType: 'graphic',
    timeline: makeTimeline(name, [
      makeLayer('Poses', '#6ec8ff', layerFrames),
    ]),
  }
}

function instance(
  libraryItemName: string,
  x: number,
  y: number,
  opts: { rotation?: number; scaleX?: number; scaleY?: number; firstFrame?: number } = {},
) {
  return {
    kind: 'symbol' as const,
    id: uid('el'),
    libraryItemName,
    symbolType: 'graphic' as const,
    firstFrame: opts.firstFrame ?? 0,
    loop: 'single frame' as const,
    matrix: compose({
      x,
      y,
      rotation: opts.rotation ?? 0,
      scaleX: opts.scaleX ?? 1,
      scaleY: opts.scaleY ?? 1,
    }),
  }
}

function limbSymbol(
  name: string,
  paths: ShapePath[],
): SymbolItem {
  return symbolTimeline(name, paths)
}

export function createMaplePuppetDocument(): Document {
  const doc = createBlankDocument('Maple Puppet', 960, 720)
  doc.backgroundColor = '#b7d4c5'
  doc.notes =
    'Demo puppet in the nested-symbol / face-swap style used by DeviantArt Animate rigs. Original character — not affiliated with any existing franchise.'
  doc.frameRate = 24

  const parts: SymbolItem[] = [
    symbolTimeline('Maple/Shoe', [
      rectPath(-18, -8, 40, 18, SHOE, INK, 2.5, 6),
      ellipsePath(14, 2, 10, 7, SHOE, INK, 2),
    ]),
    limbSymbol('Maple/LowerLeg', [
      rectPath(-10, -8, 20, 55, PANTS, INK, 2.5, 8),
    ]),
    limbSymbol('Maple/UpperLeg', [
      rectPath(-12, -10, 24, 48, PANTS, INK, 2.5, 10),
    ]),
    limbSymbol('Maple/Torso', [
      rectPath(-48, -20, 96, 110, JACKET, INK, 3, 18),
      rectPath(-48, 70, 96, 18, JACKET_TRIM, INK, 2, 6),
      ellipsePath(0, -10, 22, 14, '#f7d7b8', INK, 2),
    ]),
    limbSymbol('Maple/UpperArm', [
      rectPath(-10, -8, 20, 52, JACKET, INK, 2.5, 10),
    ]),
    limbSymbol('Maple/LowerArm', [
      rectPath(-9, -6, 18, 46, SKIN, INK, 2.5, 9),
      ellipsePath(0, 38, 12, 10, SKIN, INK, 2),
    ]),
    symbolTimeline('Maple/Beanie', [
      ellipsePath(0, 0, 58, 28, BEANIE, INK, 3),
      rectPath(-56, -6, 112, 22, BEANIE, INK, 2, 4),
      ellipsePath(0, -26, 14, 14, BEANIE_POM, INK, 2),
    ]),
    multiFrameSymbol('Maple/Eyes', [
      {
        label: 'open',
        paths: [
          ellipsePath(-22, 0, 12, 14, '#fff', INK, 2.5),
          ellipsePath(22, 0, 12, 14, '#fff', INK, 2.5),
          ellipsePath(-20, 2, 5, 6, INK),
          ellipsePath(24, 2, 5, 6, INK),
        ],
      },
      {
        label: 'happy',
        paths: [
          {
            stroke: { color: INK, weight: 3 },
            commands: [
              { type: 'move', x: -32, y: 2 },
              { type: 'quad', cx: -22, cy: -10, x: -12, y: 2 },
              { type: 'move', x: 12, y: 2 },
              { type: 'quad', cx: 22, cy: -10, x: 32, y: 2 },
            ],
          },
        ],
      },
      {
        label: 'wink',
        paths: [
          ellipsePath(-22, 0, 12, 14, '#fff', INK, 2.5),
          ellipsePath(-20, 2, 5, 6, INK),
          {
            stroke: { color: INK, weight: 3 },
            commands: [
              { type: 'move', x: 12, y: 2 },
              { type: 'quad', cx: 22, cy: -8, x: 32, y: 2 },
            ],
          },
        ],
      },
      {
        label: 'surprised',
        paths: [
          ellipsePath(-22, 0, 14, 16, '#fff', INK, 2.5),
          ellipsePath(22, 0, 14, 16, '#fff', INK, 2.5),
          ellipsePath(-22, 1, 6, 8, INK),
          ellipsePath(22, 1, 6, 8, INK),
        ],
      },
    ]),
    multiFrameSymbol('Maple/Mouth', [
      {
        label: 'smile',
        paths: [
          {
            stroke: { color: INK, weight: 3.5 },
            commands: [
              { type: 'move', x: -16, y: 0 },
              { type: 'quad', cx: 0, cy: 16, x: 16, y: 0 },
            ],
          },
        ],
      },
      {
        label: 'open',
        paths: [ellipsePath(0, 4, 12, 10, '#3a1f1a', INK, 2.5)],
      },
      {
        label: 'o',
        paths: [ellipsePath(0, 2, 8, 10, '#3a1f1a', INK, 2.5)],
      },
      {
        label: 'frown',
        paths: [
          {
            stroke: { color: INK, weight: 3.5 },
            commands: [
              { type: 'move', x: -14, y: 8 },
              { type: 'quad', cx: 0, cy: -4, x: 14, y: 8 },
            ],
          },
        ],
      },
    ]),
    symbolTimeline('Maple/Head', [
      ellipsePath(0, 10, 62, 58, SKIN, INK, 3),
      ellipsePath(-48, 18, 10, 12, '#e8a07a', undefined),
      ellipsePath(48, 18, 10, 12, '#e8a07a', undefined),
    ]),
  ]

  for (const p of parts) upsertSymbol(doc.library, p)

  // Assembled character as a movie clip
  const headParts: Timeline = makeTimeline('Maple/HeadAssembled', [
    makeLayer('Mouth', '#ff6b8a', [
      makeFrame(0, [instance('Maple/Mouth', 0, 38, { firstFrame: 0 })]),
    ]),
    makeLayer('Eyes', '#6ec8ff', [
      makeFrame(0, [instance('Maple/Eyes', 0, 8, { firstFrame: 0 })]),
    ]),
    makeLayer('Beanie', '#3d6b4f', [
      makeFrame(0, [instance('Maple/Beanie', 0, -42)]),
    ]),
    makeLayer('Head', '#f3c39a', [
      makeFrame(0, [instance('Maple/Head', 0, 0)]),
    ]),
  ])
  upsertSymbol(doc.library, {
    name: 'Maple/HeadAssembled',
    symbolType: 'movieClip',
    timeline: headParts,
  })

  const leftLeg = makeTimeline('Maple/LeftLeg', [
    makeLayer('Shoe', '#2f2a26', [
      makeFrame(0, [instance('Maple/Shoe', 2, 88)]),
    ]),
    makeLayer('Lower', '#4a5d78', [
      makeFrame(0, [instance('Maple/LowerLeg', 0, 40)]),
    ]),
    makeLayer('Upper', '#4a5d78', [
      makeFrame(0, [instance('Maple/UpperLeg', 0, 0)]),
    ]),
  ])
  upsertSymbol(doc.library, {
    name: 'Maple/LeftLeg',
    symbolType: 'movieClip',
    timeline: leftLeg,
  })

  const rightLeg = makeTimeline('Maple/RightLeg', [
    makeLayer('Shoe', '#2f2a26', [
      makeFrame(0, [instance('Maple/Shoe', 2, 88, { scaleX: -1 })]),
    ]),
    makeLayer('Lower', '#4a5d78', [
      makeFrame(0, [instance('Maple/LowerLeg', 0, 40)]),
    ]),
    makeLayer('Upper', '#4a5d78', [
      makeFrame(0, [instance('Maple/UpperLeg', 0, 0)]),
    ]),
  ])
  upsertSymbol(doc.library, {
    name: 'Maple/RightLeg',
    symbolType: 'movieClip',
    timeline: rightLeg,
  })

  const leftArm = makeTimeline('Maple/LeftArm', [
    makeLayer('Lower', '#f3c39a', [
      makeFrame(0, [instance('Maple/LowerArm', 0, 42)]),
    ]),
    makeLayer('Upper', '#c45c3a', [
      makeFrame(0, [instance('Maple/UpperArm', 0, 0)]),
    ]),
  ])
  upsertSymbol(doc.library, {
    name: 'Maple/LeftArm',
    symbolType: 'movieClip',
    timeline: leftArm,
  })

  const rightArm = makeTimeline('Maple/RightArm', [
    makeLayer('Lower', '#f3c39a', [
      makeFrame(0, [instance('Maple/LowerArm', 0, 42)]),
    ]),
    makeLayer('Upper', '#c45c3a', [
      makeFrame(0, [instance('Maple/UpperArm', 0, 0)]),
    ]),
  ])
  upsertSymbol(doc.library, {
    name: 'Maple/RightArm',
    symbolType: 'movieClip',
    timeline: rightArm,
  })

  const puppet = makeTimeline('Maple', [
    makeLayer('Head', '#f3c39a', [
      makeFrame(0, [instance('Maple/HeadAssembled', 0, -118)]),
    ]),
    makeLayer('LArm', '#c45c3a', [
      makeFrame(0, [
        instance('Maple/LeftArm', -52, -70, { rotation: 12 }),
      ]),
    ]),
    makeLayer('RArm', '#c45c3a', [
      makeFrame(0, [
        instance('Maple/RightArm', 52, -70, { rotation: -12, scaleX: -1 }),
      ]),
    ]),
    makeLayer('Torso', '#c45c3a', [
      makeFrame(0, [instance('Maple/Torso', 0, -40)]),
    ]),
    makeLayer('LLeg', '#4a5d78', [
      makeFrame(0, [instance('Maple/LeftLeg', -22, 70, { rotation: -4 })]),
    ]),
    makeLayer('RLeg', '#4a5d78', [
      makeFrame(0, [instance('Maple/RightLeg', 22, 70, { rotation: 4 })]),
    ]),
  ])
  upsertSymbol(doc.library, {
    name: 'Maple',
    symbolType: 'movieClip',
    timeline: puppet,
    linkage: 'MaplePuppet',
  })

  // Stage: place Maple + a short wave pose on frame 12
  const wave = structuredClone(
    instance('Maple', doc.width / 2, doc.height / 2 + 40),
  )
  // Pose keyframes on main timeline for a tiny walk/wave demo
  const f0 = makeFrame(0, [wave], 12)
  const waved = structuredClone(wave)
  waved.id = uid('el')
  // Rotate left arm up by nesting — for demo we rotate whole puppet slightly
  waved.matrix = compose({
    x: doc.width / 2 + 8,
    y: doc.height / 2 + 40,
    rotation: -3,
  })
  const f12 = makeFrame(12, [waved], 12)
  f12.tweenType = 'motion'
  f12.label = 'wave'

  doc.timeline = makeTimeline('Scene 1', [
    makeLayer('Character', '#f0a05a', [f0, f12]),
    makeLayer('Ground', '#6aa87a', [
      makeFrame(0, [
        shapeFromPaths(
          [rectPath(80, doc.height - 120, doc.width - 160, 40, '#6aa87a', INK, 2, 8)],
          identity(),
          'ground',
        ),
      ], 24),
    ]),
  ])

  return doc
}

export const RIG_COMPAT_NOTES = `
Craft Animator targets DeviantArt / Animate community puppet workflows:

• Nested movie clips for limbs, head, and face parts
• Graphic symbols with multi-frame eye / mouth swaps (scrub firstFrame)
• .fla (ZIP/XFL) and uncompressed .xfl folder import
• Readable .caproj.json projects (ArtCraft-style)

Tips for cartman1235-style and similar Adobe Animate rigs:
1. In Animate, File → Save As → Flash CS5 Uncompressed Document (.xfl), or keep .fla
2. Import via File → Import FLA / XFL in Craft Animator
3. Face poses live as frames inside Eyes / Mouth symbols — select the instance and change First Frame
`
