/**
 * Builds a DeviantArt-style nested puppet .fla for import smoke tests.
 * Structure mimics cartman1235-style rigs: folders, Eyes/Mouth multi-frame graphics.
 */
import JSZip from 'jszip'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../fixtures')
mkdirSync(outDir, { recursive: true })

const domDocument = `<?xml version="1.0" encoding="utf-8"?>
<DOMDocument xmlns="http://ns.adobe.com/xfl/2008/" width="960" height="720" frameRate="24" backgroundColor="#B7D4C5" currentTimeline="1">
  <folders>
    <DOMFolderItem name="Eric" itemID="1"/>
    <DOMFolderItem name="Eric/Face" itemID="2"/>
  </folders>
  <symbols>
    <Include href="Eric/Body.xml" itemID="10" lastModified="1"/>
    <Include href="Eric/Head.xml" itemID="11" lastModified="1"/>
    <Include href="Eric/Face/Eyes.xml" itemID="12" lastModified="1"/>
    <Include href="Eric/Face/Mouth.xml" itemID="13" lastModified="1"/>
    <Include href="Eric/Puppet.xml" itemID="14" lastModified="1"/>
  </symbols>
  <timelines>
    <DOMTimeline name="Scene 1">
      <layers>
        <DOMLayer name="Character" color="#FF800A" current="true">
          <frames>
            <DOMFrame index="0" duration="48" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Eric/Puppet" name="eric">
                  <matrix><Matrix tx="480" ty="400"/></matrix>
                </DOMSymbolInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timelines>
</DOMDocument>`

const body = `<?xml version="1.0" encoding="utf-8"?>
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Eric/Body" symbolType="graphic">
  <timeline>
    <DOMTimeline name="Body">
      <layers>
        <DOMLayer name="Art" color="#4FFF4F">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMRectangleObject x="-70" y="-40" objectWidth="140" objectHeight="160">
                  <fill><SolidColor color="#C45C3A"/></fill>
                </DOMRectangleObject>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timeline>
</DOMSymbolItem>`

const head = `<?xml version="1.0" encoding="utf-8"?>
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Eric/Head" symbolType="graphic">
  <timeline>
    <DOMTimeline name="Head">
      <layers>
        <DOMLayer name="Art" color="#FFCC00">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMOvalObject x="-60" y="-55" objectWidth="120" objectHeight="110">
                  <fill><SolidColor color="#F3C39A"/></fill>
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
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Eric/Face/Eyes" symbolType="graphic">
  <timeline>
    <DOMTimeline name="Eyes">
      <layers>
        <DOMLayer name="Art" color="#00FFFF">
          <frames>
            <DOMFrame index="0" keyMode="9728" name="open">
              <elements>
                <DOMOvalObject x="-28" y="-14" objectWidth="22" objectHeight="28"><fill><SolidColor color="#FFFFFF"/></fill></DOMOvalObject>
                <DOMOvalObject x="6" y="-14" objectWidth="22" objectHeight="28"><fill><SolidColor color="#FFFFFF"/></fill></DOMOvalObject>
                <DOMOvalObject x="-22" y="-6" objectWidth="10" objectHeight="12"><fill><SolidColor color="#111111"/></fill></DOMOvalObject>
                <DOMOvalObject x="12" y="-6" objectWidth="10" objectHeight="12"><fill><SolidColor color="#111111"/></fill></DOMOvalObject>
              </elements>
            </DOMFrame>
            <DOMFrame index="1" keyMode="9728" name="happy">
              <elements>
                <DOMShape>
                  <strokes><StrokeStyle index="1"><SolidStroke weight="3"><fill><SolidColor color="#111111"/></fill></SolidStroke></StrokeStyle></strokes>
                  <edges>
                    <Edge strokeStyle="1" edges="!-28 0[-14 -16 0 0!6 0[20 -16 34 0"/>
                  </edges>
                </DOMShape>
              </elements>
            </DOMFrame>
            <DOMFrame index="2" keyMode="9728" name="wink">
              <elements>
                <DOMOvalObject x="-28" y="-14" objectWidth="22" objectHeight="28"><fill><SolidColor color="#FFFFFF"/></fill></DOMOvalObject>
                <DOMOvalObject x="-22" y="-6" objectWidth="10" objectHeight="12"><fill><SolidColor color="#111111"/></fill></DOMOvalObject>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timeline>
</DOMSymbolItem>`

const mouth = `<?xml version="1.0" encoding="utf-8"?>
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Eric/Face/Mouth" symbolType="graphic">
  <timeline>
    <DOMTimeline name="Mouth">
      <layers>
        <DOMLayer name="Art" color="#FF00FF">
          <frames>
            <DOMFrame index="0" keyMode="9728" name="smile">
              <elements>
                <DOMShape>
                  <strokes><StrokeStyle index="1"><SolidStroke weight="3.5"><fill><SolidColor color="#111111"/></fill></SolidStroke></StrokeStyle></strokes>
                  <edges>
                    <Edge strokeStyle="1" edges="!-16 0[0 18 16 0"/>
                  </edges>
                </DOMShape>
              </elements>
            </DOMFrame>
            <DOMFrame index="1" keyMode="9728" name="open">
              <elements>
                <DOMOvalObject x="-12" y="-4" objectWidth="24" objectHeight="20"><fill><SolidColor color="#3A1F1A"/></fill></DOMOvalObject>
              </elements>
            </DOMFrame>
            <DOMFrame index="2" keyMode="9728" name="o">
              <elements>
                <DOMOvalObject x="-8" y="-8" objectWidth="16" objectHeight="20"><fill><SolidColor color="#3A1F1A"/></fill></DOMOvalObject>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
      </layers>
    </DOMTimeline>
  </timeline>
</DOMSymbolItem>`

const puppet = `<?xml version="1.0" encoding="utf-8"?>
<DOMSymbolItem xmlns="http://ns.adobe.com/xfl/2008/" name="Eric/Puppet" symbolType="movie clip" linkageExportForAS="true" linkageClassName="EricPuppet">
  <timeline>
    <DOMTimeline name="Puppet">
      <layers>
        <DOMLayer name="Mouth" color="#FF6B8A">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Eric/Face/Mouth" symbolType="graphic" loop="single frame" firstFrame="0">
                  <matrix><Matrix ty="-70"/></matrix>
                </DOMSymbolInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
        <DOMLayer name="Eyes" color="#6EC8FF">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Eric/Face/Eyes" symbolType="graphic" loop="single frame" firstFrame="0">
                  <matrix><Matrix ty="-110"/></matrix>
                </DOMSymbolInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
        <DOMLayer name="Head" color="#F3C39A">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Eric/Head" symbolType="graphic">
                  <matrix><Matrix ty="-120"/></matrix>
                </DOMSymbolInstance>
              </elements>
            </DOMFrame>
          </frames>
        </DOMLayer>
        <DOMLayer name="Body" color="#C45C3A">
          <frames>
            <DOMFrame index="0" keyMode="9728">
              <elements>
                <DOMSymbolInstance libraryItemName="Eric/Body" symbolType="graphic">
                  <matrix><Matrix/></matrix>
                </DOMSymbolInstance>
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
zip.file('LIBRARY/Eric/Body.xml', body)
zip.file('LIBRARY/Eric/Head.xml', head)
zip.file('LIBRARY/Eric/Face/Eyes.xml', eyes)
zip.file('LIBRARY/Eric/Face/Mouth.xml', mouth)
zip.file('LIBRARY/Eric/Puppet.xml', puppet)

const buf = await zip.generateAsync({ type: 'nodebuffer' })
const out = join(outDir, 'eric-style-rig.fla')
writeFileSync(out, buf)
writeFileSync(join(outDir, 'sample-rig.fla'), buf)
console.log('Wrote', out)
