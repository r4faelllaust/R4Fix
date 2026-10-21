/**
 * Builds a tiny synthetic .fla (ZIP/XFL) for import smoke tests.
 */
import JSZip from 'jszip'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../fixtures')
mkdirSync(outDir, { recursive: true })

const domDocument = `<?xml version="1.0" encoding="utf-8"?>
<DOMDocument xmlns="http://ns.adobe.com/xfl/2008/" width="550" height="400" frameRate="24" backgroundColor="#BEE8F5" currentTimeline="1">
  <symbols>
    <Include href="Ball.xml" itemID="1" lastModified="1"/>
    <Include href="Eyes.xml" itemID="2" lastModified="1"/>
  </symbols>
  <timelines>
    <DOMTimeline name="Scene 1">
      <layers>
        <DOMLayer name="Puppet" color="#FF800A" current="true">
          <frames>
            <DOMFrame index="0" duration="12" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Ball" name="hero">
                  <matrix><Matrix tx="275" ty="200"/></matrix>
                </DOMSymbolInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timelines>
</DOMDocument>`

const ball = `<?xml version="1.0" encoding="utf-8"?>
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Ball" symbolType="movie clip">
  <timeline>
    <DOMTimeline name="Ball">
      <layers>
        <DOMLayer name="Eyes" color="#00FFFF">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Eyes" symbolType="graphic" loop="single frame" firstFrame="0">
                  <matrix><Matrix ty="-10"/></matrix>
                </DOMSymbolInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
        <DOMLayer name="Body" color="#4FFF4F">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMOvalObject x="-40" y="-40" objectWidth="80" objectHeight="80">
                  <fill>
                    <SolidColor color="#F0A05A"/>
                  </fill>
                </DOMOvalObject>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timeline>
</DOMSymbolItem>`

const eyes = `<?xml version="1.0" encoding="utf-8"?>
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Eyes" symbolType="graphic">
  <timeline>
    <DOMTimeline name="Eyes">
      <layers>
        <DOMLayer name="Art" color="#9933CC">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMOvalObject x="-20" y="-10" objectWidth="16" objectHeight="20">
                  <fill><SolidColor color="#111111"/></fill>
                </DOMOvalObject>
                <DOMOvalObject x="4" y="-10" objectWidth="16" objectHeight="20">
                  <fill><SolidColor color="#111111"/></fill>
                </DOMOvalObject>
              </elements>
            </DOMFrame>
            <DOMFrame index="1" keyMode="9728">
              <elements>
                <DOMRectangleObject x="-22" y="-2" objectWidth="18" objectHeight="4">
                  <fill><SolidColor color="#111111"/></fill>
                </DOMRectangleObject>
                <DOMRectangleObject x="4" y="-2" objectWidth="18" objectHeight="4">
                  <fill><SolidColor color="#111111"/></fill>
                </DOMRectangleObject>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timeline>
</DOMSymbolItem>`

const zip = new JSZip()
zip.file('DOMDocument.xml', domDocument)
zip.file('LIBRARY/Ball.xml', ball)
zip.file('LIBRARY/Eyes.xml', eyes)

const buf = await zip.generateAsync({ type: 'nodebuffer' })
const out = join(outDir, 'sample-rig.fla')
writeFileSync(out, buf)
console.log('Wrote', out)
