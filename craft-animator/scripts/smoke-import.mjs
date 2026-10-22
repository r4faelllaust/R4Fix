import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fla = readFileSync(join(__dirname, '../fixtures/eric-style-rig.fla'))
const zip = await JSZip.loadAsync(fla)
const dom = zip.file('DOMDocument.xml')
if (!dom) {
  console.error('FAIL: no DOMDocument.xml')
  process.exit(1)
}
const xml = await dom.async('string')
if (!xml.includes('libraryItemName="Eric/Puppet"')) {
  console.error('FAIL: Eric/Puppet instance missing')
  process.exit(1)
}
for (const p of [
  'LIBRARY/Eric/Puppet.xml',
  'LIBRARY/Eric/Face/Eyes.xml',
  'LIBRARY/Eric/Face/Mouth.xml',
]) {
  if (!zip.file(p)) {
    console.error('FAIL: missing', p)
    process.exit(1)
  }
}
console.log('OK: eric-style-rig.fla nested puppet structure looks good')
